import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fileUrl, isImage, isPdf, isOffice, officeViewerUrl } from '@/utils/filePreview'

describe('filePreview utilities', () => {
  describe('fileUrl', () => {
    it('returns empty string for null/undefined', () => {
      expect(fileUrl(null)).toBe('')
      expect(fileUrl(undefined)).toBe('')
      expect(fileUrl('')).toBe('')
    })

    it('returns full URL for http/https paths', () => {
      expect(fileUrl('http://example.com/file.pdf')).toBe('http://example.com/file.pdf')
      expect(fileUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf')
    })

    it('prepends base URL for relative paths', () => {
      const result = fileUrl('/uploads/file.pdf')
      expect(result).toContain('uploads/file.pdf')
    })

    it('strips leading slash from relative paths', () => {
      const result = fileUrl('/uploads/file.pdf')
      expect(result).not.toContain('//uploads')
    })
  })

  describe('isImage', () => {
    it('returns false for null/undefined/empty', () => {
      expect(isImage(null)).toBe(false)
      expect(isImage(undefined)).toBe(false)
      expect(isImage('')).toBe(false)
    })

    it('returns true for jpg files', () => {
      expect(isImage('photo.jpg')).toBe(true)
      expect(isImage('photo.jpeg')).toBe(true)
    })

    it('returns true for png files', () => {
      expect(isImage('image.png')).toBe(true)
    })

    it('returns true for gif files', () => {
      expect(isImage('animation.gif')).toBe(true)
    })

    it('returns true for webp files', () => {
      expect(isImage('image.webp')).toBe(true)
    })

    it('returns false for other file types', () => {
      expect(isImage('document.pdf')).toBe(false)
      expect(isImage('presentation.pptx')).toBe(false)
      expect(isImage('file.txt')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isImage('photo.JPG')).toBe(true)
      expect(isImage('image.PNG')).toBe(true)
      expect(isImage('image.WebP')).toBe(true)
    })
  })

  describe('isPdf', () => {
    it('returns false for null/undefined/empty', () => {
      expect(isPdf(null)).toBe(false)
      expect(isPdf(undefined)).toBe(false)
      expect(isPdf('')).toBe(false)
    })

    it('returns true for pdf files', () => {
      expect(isPdf('document.pdf')).toBe(true)
      expect(isPdf('DOCUMENT.PDF')).toBe(true)
    })

    it('returns false for other file types', () => {
      expect(isPdf('image.jpg')).toBe(false)
      expect(isPdf('presentation.pptx')).toBe(false)
    })
  })

  describe('isOffice', () => {
    it('returns false for null/undefined/empty', () => {
      expect(isOffice(null)).toBe(false)
      expect(isOffice(undefined)).toBe(false)
      expect(isOffice('')).toBe(false)
    })

    it('returns true for pptx files', () => {
      expect(isOffice('presentation.pptx')).toBe(true)
    })

    it('returns true for ppt files', () => {
      expect(isOffice('presentation.ppt')).toBe(true)
    })

    it('returns true for potx files', () => {
      expect(isOffice('template.potx')).toBe(true)
    })

    it('returns false for other file types', () => {
      expect(isOffice('document.pdf')).toBe(false)
      expect(isOffice('image.jpg')).toBe(false)
      expect(isOffice('file.txt')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(isOffice('presentation.PPTX')).toBe(true)
      expect(isOffice('presentation.PPT')).toBe(true)
    })
  })

  describe('officeViewerUrl', () => {
    it('generates Google Docs viewer URL', () => {
      const result = officeViewerUrl('/uploads/presentation.pptx')
      expect(result).toContain('https://docs.google.com/gview')
      expect(result).toContain('embedded=true')
      expect(result).toContain(encodeURIComponent('http://localhost:8002/uploads/presentation.pptx'))
    })

    it('encodes the file URL properly', () => {
      const result = officeViewerUrl('/uploads/my presentation.pptx')
      expect(result).toContain(encodeURIComponent('my presentation.pptx'))
    })
  })
})