import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from passlib.context import CryptContext
from starlette.templating import Jinja2Templates
from dotenv import load_dotenv
from fastapi import HTTPException, BackgroundTasks
from datetime import datetime

load_dotenv()

YEAR = datetime.now().year
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
templates = Jinja2Templates(directory="templates")

FROM_NAME  = "CANECSA Events"
FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "info@canecsa.org")

# --- PASSWORD UTILS ---


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


# --- CORE EMAIL SENDER ---


logger = logging.getLogger(__name__)


APP_BASE_URL = os.getenv("APP_BASE_URL", "https://abstracts.canecsa.org")


def _create_email_log(db, recipient_email, subject, email_type, sent_by_user_id,
                      reply_to_email, body=None):
    """Insert a pending email log entry before sending. Returns the record ID or None."""
    try:
        from models.models import EmailLog
        record = EmailLog(
            recipient_email=recipient_email,
            subject=subject,
            email_type=email_type,
            sent_by_user_id=sent_by_user_id,
            reply_to_email=reply_to_email,
            status="pending",
            body=body,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record.id
    except Exception as log_err:
        logger.error("Failed to create email log entry: %s", log_err)
        return None


def _update_email_log(db, log_id, status, error_message=None):
    """Update the status of an existing email log entry after the send attempt."""
    try:
        from models.models import EmailLog
        record = db.query(EmailLog).filter(EmailLog.id == log_id).first()
        if record:
            record.status = status
            record.error_message = error_message
            db.commit()
    except Exception as log_err:
        logger.error("Failed to update email log entry %s: %s", log_id, log_err)


def send_email(recipient_email, subject, email_body, reply_to_email=None,
               email_type="general", sent_by_user_id=None, db=None,
               sender_display_name=None):
    smtp_host     = os.getenv("SMTP_HOST", "")
    smtp_port     = os.getenv("SMTP_PORT", "")
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_host or not smtp_port:
        logger.error("SMTP host and port must be set in environment variables.")
        if db:
            _create_email_log(db, recipient_email, subject, email_type, sent_by_user_id,
                              reply_to_email, email_body)
            # immediately mark as failed — re-fetch last inserted
            from models.models import EmailLog
            last = db.query(EmailLog).order_by(EmailLog.id.desc()).first()
            if last:
                _update_email_log(db, last.id, "failed", "SMTP not configured")
        return

    try:
        smtp_port = int(smtp_port)
    except ValueError:
        logger.error("SMTP_PORT must be an integer.")
        return

    # Create log record BEFORE sending so we have an ID for the tracking pixel
    log_id = None
    if db:
        log_id = _create_email_log(db, recipient_email, subject, email_type,
                                   sent_by_user_id, reply_to_email, email_body)

    # Inject a 1×1 tracking pixel so we can detect when the email is opened
    final_body = email_body
    if log_id:
        pixel = (
            f'<img src="{APP_BASE_URL}/email-logs/{log_id}/pixel.png"'
            ' width="1" height="1" style="display:none;" alt="" />'
        )
        final_body = email_body.replace("</body>", f"{pixel}\n</body>", 1)

    # Use "Name via CANECSA Events <info@canecsa.org>" when a personal sender is provided
    display_name = f"{sender_display_name} via {FROM_NAME}" if sender_display_name else FROM_NAME

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            message = MIMEMultipart()
            message["From"]    = f"{display_name} <{FROM_EMAIL}>"
            message["To"]      = recipient_email
            message["Subject"] = subject
            if reply_to_email:
                message["Reply-To"] = reply_to_email
            message.attach(MIMEText(final_body, "html"))
            server.sendmail(smtp_username, recipient_email, message.as_string())
            logger.info("Email sent successfully to %s", recipient_email)
            if db and log_id:
                _update_email_log(db, log_id, "sent")
    except Exception as e:
        logger.error("Failed to send email to %s: %s", recipient_email, str(e))
        if db:
            if log_id:
                _update_email_log(db, log_id, "failed", str(e))
            else:
                # logging was unavailable before send; attempt a fresh log entry
                _create_email_log(db, recipient_email, subject, email_type,
                                  sent_by_user_id, reply_to_email, email_body)


# --- BACKGROUND TASK WRAPPER ---
def send_email_backgroundable(
    recipient_email, subject, email_body, background_tasks: BackgroundTasks = None,
    reply_to_email=None, email_type="general", sent_by_user_id=None, db=None,
    sender_display_name=None,
):
    if background_tasks:
        background_tasks.add_task(
            send_email, recipient_email, subject, email_body,
            reply_to_email, email_type, sent_by_user_id, db, sender_display_name,
        )
    else:
        send_email(recipient_email, subject, email_body,
                   reply_to_email, email_type, sent_by_user_id, db, sender_display_name)


# --- BULK SENDER (single SMTP connection for many recipients) ---

def send_bulk_emails(messages: list, db=None):
    """
    Send multiple emails over a single SMTP connection.
    messages: list of dicts with keys: recipient_email, subject, body,
              email_type, sent_by_user_id, reply_to_email (optional)
    """
    smtp_host     = os.getenv("SMTP_HOST", "")
    smtp_port     = os.getenv("SMTP_PORT", "")
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_host or not smtp_port:
        logger.error("SMTP not configured — bulk send aborted")
        return

    try:
        smtp_port = int(smtp_port)
    except ValueError:
        logger.error("SMTP_PORT is not a valid integer")
        return

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
    except Exception as e:
        logger.error("Failed to open SMTP connection for bulk send: %s", e)
        return

    try:
        for msg in messages:
            recipient_email  = msg["recipient_email"]
            subject          = msg["subject"]
            body             = msg["body"]
            email_type       = msg.get("email_type", "general")
            sent_by_user_id  = msg.get("sent_by_user_id")
            reply_to_email   = msg.get("reply_to_email")

            log_id = None
            if db:
                log_id = _create_email_log(db, recipient_email, subject, email_type,
                                           sent_by_user_id, reply_to_email, body)

            final_body = body
            if log_id:
                pixel = (
                    f'<img src="{APP_BASE_URL}/email-logs/{log_id}/pixel.png"'
                    ' width="1" height="1" style="display:none;" alt="" />'
                )
                final_body = body.replace("</body>", f"{pixel}\n</body>", 1)

            mime_msg = MIMEMultipart()
            mime_msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
            mime_msg["To"]      = recipient_email
            mime_msg["Subject"] = subject
            if reply_to_email:
                mime_msg["Reply-To"] = reply_to_email
            mime_msg.attach(MIMEText(final_body, "html"))

            try:
                server.sendmail(smtp_username, recipient_email, mime_msg.as_string())
                logger.info("Bulk send: email sent to %s", recipient_email)
                if db and log_id:
                    _update_email_log(db, log_id, "sent")
            except smtplib.SMTPServerDisconnected:
                # Reconnect once if server dropped the connection mid-batch
                logger.warning("SMTP disconnected mid-batch — reconnecting")
                try:
                    server = smtplib.SMTP(smtp_host, smtp_port)
                    server.starttls()
                    server.login(smtp_username, smtp_password)
                    server.sendmail(smtp_username, recipient_email, mime_msg.as_string())
                    if db and log_id:
                        _update_email_log(db, log_id, "sent")
                except Exception as reconnect_err:
                    logger.error("Reconnect failed for %s: %s", recipient_email, reconnect_err)
                    if db and log_id:
                        _update_email_log(db, log_id, "failed", str(reconnect_err))
            except Exception as e:
                logger.error("Bulk send: failed to send to %s: %s", recipient_email, e)
                if db and log_id:
                    _update_email_log(db, log_id, "failed", str(e))
    finally:
        try:
            server.quit()
        except Exception:
            pass


# --- EMAIL FUNCTIONS ---


def new_account_email(
    recipient_email, firstname, password, event_name=None,
    background_tasks: BackgroundTasks = None, db=None, sent_by_user_id=None,
):
    subject = "Welcome to CANECSA Events Portal – Your Account Details"
    template = templates.get_template("acount_creation_template.html")
    email_body = template.render(
        subject=subject,
        username=recipient_email,
        password=password,
        firstname=firstname,
        event_name=event_name,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="new_account", sent_by_user_id=sent_by_user_id, db=db)


def admin_password_reset_email(
    recipient_email, firstname, password,
    background_tasks: BackgroundTasks = None, db=None, sent_by_user_id=None,
):
    subject = "Your Password Has Been Reset – CANECSA Events Portal"
    template = templates.get_template("admin_password_reset_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        email=recipient_email,
        password=password,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="admin_password_reset", sent_by_user_id=sent_by_user_id, db=db)


def reset_password_request_email(
    recipient_email, firstname, reset_token, background_tasks: BackgroundTasks = None,
    db=None,
):
    subject = "Password Reset Request"
    template = templates.get_template("password_reset_request_template.html")
    email_body = template.render(
        subject=subject,
        username=recipient_email,
        firstname=firstname,
        reset_token=reset_token,
        app_base_url=APP_BASE_URL,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="password_reset_request", db=db)


def password_reset_email(
    recipient_email, firstname, background_tasks: BackgroundTasks = None, db=None,
):
    subject = "Your CANECSA Event Spaces Account password has been reset"
    template = templates.get_template("password_reset_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        email=recipient_email,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="password_reset", db=db)


def account_verification_email(
    recipient_email, firstname, background_tasks: BackgroundTasks = None
):
    subject = "Your CANECSA Event Spaces Account has been verified"
    template = templates.get_template("account_verification_template.html")
    email_body = template.render(
        subject=subject,
        email=recipient_email,
        firstname=firstname,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks)


def account_verification_request_email(
    recipient_email,
    firstname,
    verification_token,
    background_tasks: BackgroundTasks = None,
):
    subject = "Account Verification Request"
    template = templates.get_template("account_verification_request_template.html")
    email_body = template.render(
        subject=subject,
        email=recipient_email,
        firstname=firstname,
        verification_token=verification_token,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks)


def organisation_verification_request_email(
    recipient_email, firstname, organisation, background_tasks: BackgroundTasks = None
):
    subject = "Organisation Verification Request"
    template = templates.get_template("organisation_verification_request_template.html")
    email_body = template.render(
        subject=subject,
        email=recipient_email,
        firstname=firstname,
        organisation=organisation.organisation,
        organisation_id=organisation.id,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks)


def organisation_approval_status_email(
    recipient_email,
    firstname,
    organisation,
    status,
    background_tasks: BackgroundTasks = None,
):
    subject = "Organisation Approval Status"
    template = templates.get_template("organisation_approval_status_template.html")
    email_body = template.render(
        subject=subject,
        email=recipient_email,
        firstname=firstname,
        organisation=organisation.organisation,
        organisation_id=organisation.id,
        status=status,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks)


def payment_reminder_email(
    recipient_email,
    firstname,
    event_name,
    payment_url="https://canecsa.org/payment/",
    portal_url="https://abstracts.canecsa.org",
    background_tasks: BackgroundTasks = None,
    db=None,
    sent_by_user_id=None,
):
    subject = f"Action Required: Complete Your Payment – {event_name}"
    template = templates.get_template("payment_reminder_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        event_name=event_name,
        payment_url=payment_url,
        portal_url=portal_url,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="payment_reminder", sent_by_user_id=sent_by_user_id, db=db)


def event_invitation_email(
    recipient_email,
    firstname,
    event_name,
    participation_role,
    event_location=None,
    event_dates=None,
    is_new_user=False,
    password=None,
    no_payment=False,
    portal_url="https://abstracts.canecsa.org",
    payment_url="https://canecsa.org/payment/",
    background_tasks: BackgroundTasks = None,
    db=None,
    sent_by_user_id=None,
):
    subject = f"You Have Been Registered for {event_name} – CANECSA Events Portal"
    template = templates.get_template("event_invitation_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        email=recipient_email,
        event_name=event_name,
        participation_role=participation_role,
        event_location=event_location,
        event_dates=event_dates,
        is_new_user=is_new_user,
        password=password,
        no_payment=no_payment,
        portal_url=portal_url,
        payment_url=payment_url,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="event_invitation", sent_by_user_id=sent_by_user_id, db=db)


def reviewer_assignment_email(
    recipient_email,
    firstname,
    password,
    abstract_title,
    event_name=None,
    assigned_by_name=None,
    assigned_by_email=None,
    sent_by_user_id=None,
    background_tasks: BackgroundTasks = None,
    db=None,
):
    subject = "You Have Been Assigned an Abstract to Review – CANECSA Events Portal"
    template = templates.get_template("reviewer_assignment_template.html")
    email_body = template.render(
        subject=subject,
        username=recipient_email,
        firstname=firstname,
        password=password,
        abstract_title=abstract_title,
        event_name=event_name,
        assigned_by_name=assigned_by_name or "CANECSA Secretariat",
        assigned_by_email=assigned_by_email or FROM_EMAIL,
        year=YEAR,
    )
    send_email_backgroundable(
        recipient_email, subject, email_body, background_tasks,
        reply_to_email=assigned_by_email,
        email_type="reviewer_assignment",
        sent_by_user_id=sent_by_user_id,
        sender_display_name=assigned_by_name,
        db=db,
    )


def reviewer_reminder_email(
    recipient_email,
    firstname,
    abstract_title,
    assigned_at,
    event_name=None,
    background_tasks: BackgroundTasks = None,
    db=None,
):
    subject = f"Reminder: Your Abstract Review Is Still Pending – {abstract_title[:60]}"
    template = templates.get_template("reviewer_reminder_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        abstract_title=abstract_title,
        event_name=event_name,
        assigned_at=assigned_at.strftime("%d %B %Y, %H:%M UTC"),
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="reviewer_reminder", db=db)


def reviewer_bulk_assignment_email(
    recipient_email,
    firstname,
    password,
    abstracts,           # list of {"title": ..., "event": ...}
    assigned_by_name=None,
    assigned_by_email=None,
    sent_by_user_id=None,
    background_tasks: BackgroundTasks = None,
    db=None,
):
    count = len(abstracts)
    subject = (
        f"You Have Been Assigned {count} Abstract{'s' if count != 1 else ''} to Review – CANECSA Events Portal"
    )
    template = templates.get_template("reviewer_bulk_assignment_template.html")
    email_body = template.render(
        subject=subject,
        username=recipient_email,
        firstname=firstname,
        password=password,
        abstracts=abstracts,
        count=count,
        assigned_by_name=assigned_by_name or "CANECSA Secretariat",
        assigned_by_email=assigned_by_email or FROM_EMAIL,
        year=YEAR,
    )
    send_email_backgroundable(
        recipient_email, subject, email_body, background_tasks,
        reply_to_email=assigned_by_email,
        email_type="reviewer_assignment",
        sent_by_user_id=sent_by_user_id,
        sender_display_name=assigned_by_name,
        db=db,
    )


def proof_of_payment_received_email(
    recipient_email,
    firstname,
    event_name,
    background_tasks: BackgroundTasks = None,
    db=None,
    sent_by_user_id=None,
):
    subject = f"Proof of Payment Received – {event_name}"
    template = templates.get_template("proof_received_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        event_name=event_name,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="proof_received", sent_by_user_id=sent_by_user_id, db=db)


def payment_verified_email(
    recipient_email,
    firstname,
    event_name,
    password=None,
    portal_url="https://abstracts.canecsa.org",
    background_tasks: BackgroundTasks = None,
    db=None,
    sent_by_user_id=None,
):
    subject = f"Payment Confirmed – Your Registration is Complete – {event_name}"
    template = templates.get_template("payment_verified_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        event_name=event_name,
        email=recipient_email,
        password=password,
        portal_url=portal_url,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="payment_verified", sent_by_user_id=sent_by_user_id, db=db)


def registration_reminder_email(
    recipient_email,
    firstname,
    event_name,
    event_url,
    portal_url="https://abstracts.canecsa.org",
    deadline_label="7 July 2026",
    days_remaining=2,
    background_tasks: BackgroundTasks = None,
    db=None,
    sent_by_user_id=None,
):
    subject = f"Action Required – {days_remaining} Day{'s' if days_remaining != 1 else ''} Left to Register: {event_name}"
    template = templates.get_template("registration_reminder_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        event_name=event_name,
        event_url=event_url,
        portal_url=portal_url,
        deadline_label=deadline_label,
        days_remaining=days_remaining,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="registration_reminder", sent_by_user_id=sent_by_user_id, db=db)


def abstract_acceptance_email(
    recipient_email,
    firstname,
    abstract_title,
    presentation_type,          # "oral" | "poster"
    event_name,
    portal_url,
    ppt_template_url,
    is_eswatini=False,
    sent_by_user_id=None,
    background_tasks: BackgroundTasks = None,
    db=None,
):
    subject = f"Congratulations! Your Abstract Has Been Accepted – {event_name}"
    template = templates.get_template("abstract_acceptance_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        abstract_title=abstract_title,
        presentation_type=presentation_type,
        event_name=event_name,
        portal_url=portal_url,
        ppt_template_url=ppt_template_url,
        is_eswatini=is_eswatini,
        year=YEAR,
    )
    send_email_backgroundable(
        recipient_email, subject, email_body, background_tasks,
        email_type="abstract_acceptance",
        sent_by_user_id=sent_by_user_id,
        db=db,
    )


def incomplete_registration_reminder_email(
    recipient_email,
    firstname,
    portal_url="https://abstracts.canecsa.org",
    background_tasks: BackgroundTasks = None,
    db=None,
):
    subject = "Complete Your Registration – CANECSA Events Portal"
    template = templates.get_template("incomplete_registration_template.html")
    email_body = template.render(
        subject=subject,
        firstname=firstname,
        portal_url=portal_url,
        year=YEAR,
    )
    send_email_backgroundable(recipient_email, subject, email_body, background_tasks,
                              email_type="incomplete_registration_reminder", db=db)
