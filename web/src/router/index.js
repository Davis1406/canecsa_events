import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import MyAccountLayout from "@/layouts/MyAccountLayout.vue";

// Public Pages
import HomeView from "@/pages/public/HomeView.vue";
import EventsView from "@/pages/public/EventsView.vue";
import EventView from "@/pages/public/EventView.vue";
import LoginView from "@/pages/public/LoginView.vue";
import PasswordResetLinkView from "@/pages/public/PasswordResetLinkView.vue";
import ResetPasswordView from "@/pages/public/ResetPasswordView.vue";
import RegisterView from "@/pages/public/RegisterView.vue";
import RegisterAccountView from "@/pages/public/RegisterAccountView.vue";
import ContactView from "@/pages/public/ContactView.vue";
import AbstractSubmissionView from "@/pages/public/AbstractSubmissionView.vue";
import PaymentView from "@/pages/public/PaymentView.vue";
import EventAttendanceView from "@/pages/public/EventAttendanceView.vue";
import RegistrationView from "@/pages/public/RegistrationView.vue";
import ChangePasswordView from "@/pages/public/ChangePasswordView.vue";

// Admin Pages
import DashboardView from "@/pages/admin/DashboardView.vue";
import ClustersView from "@/pages/admin/clusters/ClustersView.vue";
import AddClusterView from "@/pages/admin/clusters/AddClusterView.vue";
import ClusterView from "@/pages/admin/clusters/ClusterView.vue";
import EditClusterView from "@/pages/admin/clusters/EditClusterView.vue";
import AdminEventsView from "@/pages/admin/events/EventsView.vue";
import AddEventView from "@/pages/admin/events/AddEventView.vue";
import EditEventView from "@/pages/admin/events/EditEventView.vue";
// import MyEventsView from "@/pages/admin/events/MyEventsView.vue";
import AdminEventView from "@/pages/admin/events/AdminEventView.vue";
import AdminEventReport from "@/pages/admin/events/AdminEventReport.vue";
import UsersView from "@/pages/admin/users/UsersView.vue";
import AddUserView from "@/pages/admin/users/AddUserView.vue";
import UserView from "@/pages/admin/users/UserView.vue";
import EditUserView from "@/pages/admin/users/EditUserView.vue";
import AdminUserPerspectiveView from "@/pages/admin/users/AdminUserPerspectiveView.vue";
import RolesView from "@/pages/admin/roles/RolesView.vue";
import AddRoleView from "@/pages/admin/roles/AddRoleView.vue";
import RoleView from "@/pages/admin/roles/RoleView.vue";
import EditRoleView from "@/pages/admin/roles/EditRoleView.vue";
import SettingsView from "@/pages/admin/settings/SettingsView.vue";
import MyAccountDashboardView from "@/pages/my_account/DashboardView.vue";
import MyProfileView from "@/pages/my_account/MyProfileView.vue";
import MyEventsView from "@/pages/my_account/MyEventsView.vue";
import MyEventView from "@/pages/my_account/MyEventView.vue";
import AbstractsView from "@/pages/admin/abstracts/AbstractsView.vue";
import AbstractView from "@/pages/admin/abstracts/AbstractView.vue";
import TracksView from "@/pages/admin/tracks/TracksView.vue";
import ActivityView from "@/pages/admin/activity/ActivityView.vue";
import EmailLogsView from "@/pages/admin/settings/EmailLogsView.vue";
import ReviewersView from "@/pages/admin/abstracts/ReviewersView.vue";
import RegistrationsView from "@/pages/admin/registrations/RegistrationsView.vue";
import IncompleteRegistrationsView from "@/pages/admin/users/IncompleteRegistrationsView.vue";
import MyAbstractsView from "@/pages/my_account/MyAbstractsView.vue";
import MyAbstractPresentationView from "@/pages/my_account/MyAbstractPresentationView.vue";
import MyReviewsView from "@/pages/my_account/MyReviewsView.vue";

// Error Pages
import ForbiddenView from "@/pages/errors/ForbiddenView.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "", name: "Home", redirect: "/abstract-submission" },
      { path: "abstract-submission", name: "AbstractSubmission", component: AbstractSubmissionView },
      { path: "events", name: "Events", component: EventsView },
      { path: "event/:id", name: "Event", component: EventView },
      { path: "login", name: "Login", component: LoginView },
      {
        path: "password-reset-link",
        name: "PasswordResetLink",
        component: PasswordResetLinkView,
      },
      {
        path: "reset-password/:token",
        name: "ResetPasswordView",
        component: ResetPasswordView,
      },
      { path: "contact", name: "Contact", component: ContactView },
      { path: "register/:id", name: "Register", component: RegisterView },
      {
        path: "register-account",
        name: "RegisterAccount",
        component: RegisterAccountView,
      },
      {
        path: "/payment/:event_id/:registration_id?",
        name: "EventPayment",
        component: PaymentView,
      },

      {
        path: "event-attendance/:id",
        name: "EventAttendance",
        component: EventAttendanceView,
      },

      {
        path: "registration/:id",
        name: "Registration",
        component: RegistrationView,
      },
      {
        path: "change-password",
        name: "ChangePassword",
        component: ChangePasswordView,
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: "/my-account",
    component: MyAccountLayout,
    children: [
      {
        path: "dashboard",
        name: "MyDashboard",
        component: MyAccountDashboardView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-profile",
        name: "MyProfile",
        component: MyProfileView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-events",
        name: "MyEvents",
        component: MyEventsView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-event/:id",
        name: "MyEvent",
        component: MyEventView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-abstracts",
        name: "MyAbstracts",
        component: MyAbstractsView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-abstract-presentation",
        name: "MyAbstractPresentation",
        component: MyAbstractPresentationView,
        meta: { requiresAuth: true },
      },
      {
        path: "my-reviews",
        name: "MyReviews",
        component: MyReviewsView,
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: "/admin",
    component: AdminLayout,
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: DashboardView,
        meta: { requiresAuth: true },
      },
      {
        path: "clusters",
        name: "Clusters",
        component: ClustersView,
        meta: { requiresAuth: true, permissions: ["VIEW_ORG_UNIT"] },
      },
      {
        path: "add-cluster",
        name: "AddCluster",
        component: AddClusterView,
        meta: { requiresAuth: true, permissions: ["ADD_ORG_UNIT"] },
      },
      {
        path: "cluster/:id",
        name: "Cluster",
        component: ClusterView,
        meta: { requiresAuth: true, permissions: ["VIEW_ORG_UNIT"] },
      },
      {
        path: "/clusters/:id/edit",
        name: "EditCluster",
        component: EditClusterView,
        meta: { requiresAuth: true, permissions: ["UPDATE_ORG_UNIT"] },
      },
      {
        path: "admin-events",
        name: "AdminEvents",
        component: AdminEventsView,
        meta: { requiresAuth: true, permissions: ["VIEW_EVENT"] },
      },
      {
        path: "add-event",
        name: "AddEvent",
        component: AddEventView,
        meta: { requiresAuth: true, permissions: ["ADD_EVENT"] },
      },
      {
        path: "admin-events/:id",
        name: "AdminEvent",
        component: AdminEventView,
        meta: { requiresAuth: true, permissions: ["VIEW_EVENT"] },
      },
      {
        path: "admin-events/:id/report",
        name: "AdminEventReport",
        component: AdminEventReport,
        meta: { requiresAuth: true, permissions: ["VIEW_EVENT"] },
      },
      {
        path: "/admin-events/:id/edit",
        name: "EditEvent",
        component: EditEventView,
        meta: { requiresAuth: true, permissions: ["UPDATE_EVENT"] },
      },
      {
        path: "users",
        name: "Users",
        component: UsersView,
        meta: { requiresAuth: true, permissions: ["VIEW_USER"] },
      },
      {
        path: "add-user",
        name: "AddUser",
        component: AddUserView,
        meta: { requiresAuth: true, permissions: ["ADD_USER"] },
      },
      {
        path: "users/:id",
        name: "User",
        component: UserView,
        meta: { requiresAuth: true, permissions: ["VIEW_USER"] },
      },
      {
        path: "edit-user/:id",
        name: "EditUser",
        component: EditUserView,
        meta: { requiresAuth: true, permissions: ["UPDATE_USER"] },
      },
      {
        path: "users/:id/perspective",
        name: "AdminUserPerspective",
        component: AdminUserPerspectiveView,
        meta: { requiresAuth: true, permissions: ["VIEW_USER"] },
      },
      {
        path: "roles",
        name: "Roles",
        component: RolesView,
        meta: { requiresAuth: true, permissions: ["VIEW_ROLE"] },
      },
      {
        path: "add-role",
        name: "AddRole",
        component: AddRoleView,
        meta: { requiresAuth: true, permissions: ["ADD_ROLE"] },
      },
      {
        path: "role/:id",
        name: "Role",
        component: RoleView,
        meta: { requiresAuth: true, permissions: ["VIEW_ROLE"] },
      },
      {
        path: "/roles/:id/edit",
        name: "EditRole",
        component: EditRoleView,
        meta: { requiresAuth: true, permissions: ["UPDATE_ROLE"] },
      },
      {
        path: "settings",
        name: "Settings",
        component: SettingsView,
        meta: { requiresAuth: true, permissions: ["VIEW_USER"] },
      },
      { path: "abstracts", name: "AdminAbstracts", component: AbstractsView, meta: { requiresAuth: true, permissions: ["VIEW_ABSTRACTS"] } },
      { path: "abstracts/:id", name: "AdminAbstract", component: AbstractView, meta: { requiresAuth: true, permissions: ["VIEW_ABSTRACTS"] } },
      { path: "tracks", name: "AdminTracks", component: TracksView, meta: { requiresAuth: true, permissions: ["VIEW_ABSTRACTS"] } },
      { path: "reviewers", name: "AdminReviewers", component: ReviewersView, meta: { requiresAuth: true, permissions: ["MANAGE_REVIEWERS"] } },
      { path: "registrations", name: "AdminRegistrations", component: RegistrationsView, meta: { requiresAuth: true, permissions: ["VIEW_REGISTRATIONS"] } },
      { path: "activity", name: "AdminActivity", component: ActivityView, meta: { requiresAuth: true, permissions: ["VIEW_USER"] } },
      { path: "email-logs", name: "AdminEmailLogs", component: EmailLogsView, meta: { requiresAuth: true, permissions: ["VIEW_USER"] } },
      { path: "incomplete-registrations", name: "IncompleteRegistrations", component: IncompleteRegistrationsView, meta: { requiresAuth: true, permissions: ["VIEW_USER"] } },
    ],
  },
  {
    path: "/403",
    name: "Forbidden",
    component: ForbiddenView,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/abstract-submission",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (!auth.token) auth.loadFromStorage();

  // Refresh permissions from server whenever we're working from stale localStorage data
  if (auth.needsRefresh) {
    await auth.refreshPermissions();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: "Login" });
  }

  // Force password change before accessing any protected page (skip during impersonation)
  if (auth.isAuthenticated && auth.mustChangePassword && to.name !== "ChangePassword" && !auth.impersonating) {
    return next({ name: "ChangePassword" });
  }

  if (to.meta.permissions) {
    const hasPermission = to.meta.permissions.every((p) =>
      auth.hasPermission(p)
    );
    if (!hasPermission) return next({ name: "Forbidden" });
  }

  next();
});

export default router;
