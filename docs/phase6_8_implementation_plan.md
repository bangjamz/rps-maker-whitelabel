# Phase 6-8 Implementation Plan

**Scope:** Complete SIAKAD essential features & advanced analytics  
**Timeline:** Phased approach based on dependencies  
**Status:** Planning

---

## 🎯 Overview

Implementing all remaining features to transform RPS system into full SIAKAD:

**Phase 6 (Priority 1 - WAJIB):**
1. Student Enrollment Management
2. RPS Creation/Edit UI for Dosen (Excel-like interface)
3. Dashboard Analytics Enhancement
4. CPL & CPMK Achievement Analytics (WAJIB - complex)

**Phase 7 (Priority 2 - Nice to Have):**
5. PDF RPS Export with Templates
6. Email Notifications System (with settings & bulk send)
7. Multiple Roles per User

**Phase 8 (Priority 3 - Advanced):**
8. QR Code Attendance
9. Mahasiswa Self-Service Portal

---

## 🔴 Phase 6.1: Student Enrollment Management (CRITICAL - BLOCKING)

> **Why First:** Currently using mock data. Real enrollment needed for grading, attendance, and all student-related features.

### Database Design

```sql
CREATE TABLE enrollment (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INT REFERENCES mahasiswa(id),
  mata_kuliah_id INT REFERENCES mata_kuliah(id),
  semester VARCHAR(20),
  tahun_ajaran VARCHAR(20),
  status ENUM('Active', 'Dropped', 'Completed'),
  enrolled_at TIMESTAMP,
  dropped_at TIMESTAMP,
  
  UNIQUE(mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran)
);

CREATE INDEX idx_enrollment_course ON enrollment(mata_kuliah_id);
CREATE INDEX idx_enrollment_student ON enrollment(mahasiswa_id);
```

### Backend APIs

```
POST   /api/enrollment                  - Enroll student(s) to course
DELETE /api/enrollment/:id              - Unenroll student
GET    /api/enrollment/course/:id       - Get enrolled students
GET    /api/enrollment/student/:id      - Get student's courses
POST   /api/enrollment/bulk             - Bulk enrollment (CSV import)
```

### Frontend UI

1. **Course Enrollment Page** (Admin/Kaprodi)
   - Course selector
   - Student multi-select (or CSV upload)
   - Bulk enroll button
   - Enrolled students table (with unenroll action)

2. **Student Course List** (Mahasiswa view)
   - My enrolled courses
   - Semester filter
   - Status badges

### Integration Impact
- ✅ Grading: Use real student list instead of mock
- ✅ Attendance: Use real student list
- ✅ Reports: Accurate data

**Estimated Effort:** 4-6 hours

---

## 🟢 Phase 6.2: RPS Creation/Edit UI for Dosen

> **Requirement:** Excel-like editable grid, dropdowns with dependencies (CPL → CPMK → Sub-CPMK), bulk create pertemuan

### Backend APIs

```
POST   /api/rps/create                  - Create new RPS (Dosen)
PUT    /api/rps/:id                     - Update RPS
POST   /api/rps/:id/pertemuan/bulk      - Bulk create pertemuan
GET    /api/curriculum/dependencies     - Get CPL → CPMK → Sub-CPMK tree
```

### UI Design - Excel-like Grid

#### 1. RPS Editor Page

**Route:** `/dosen/rps/create` or `/dosen/rps/:id/edit`

**Sections:**

##### A. Basic Info (Form)
- Mata Kuliah (dropdown)
- Semester, Tahun Ajaran
- Deskripsi MK

##### B. CPL/CPMK Mapping (Checklist Tree)
```
☑ CPL 1: Mampu menerapkan...
  ☑ CPMK 1.1: Memahami konsep...
    ☑ Sub-CPMK 1.1.1: ...
  ☐ CPMK 1.2: ...
☐ CPL 2: ...
```

##### C. Pertemuan Grid (Excel-like)

**Columns:**
- Pertemuan Ke (auto number)
- Tanggal (date picker)
- Topik (text input)
- Sub-CPMK (dropdown - filtered by selected CPMKs)
- Metode Pembelajaran (text)
- Materi (text)
- Bentuk Evaluasi (text)

**Features:**
- ✅ Inline editing (click cell to edit)
- ✅ Dropdown dependencies (Sub-CPMK only shows selected CPMK's children)
- ✅ Bulk actions:
  - Add 14 rows (standard semester)
  - Auto-fill dates (weekly from start date)
  - Copy row
  - Delete row(s)
- ✅ Auto-save (debounced)

**Library:** Use `react-data-grid` or `ag-Grid` for Excel-like experience

##### D. Penilaian/Assessment (Table)
- Komponen (UTS, UAS, Tugas, etc.)
- Bobot (%)
- Kriteria

##### E. Save & Submit
- Save Draft button
- Submit for Approval button

### Technical Implementation

```jsx
import DataGrid from 'react-data-grid';

const columns = [
  { key: 'pertemuan_ke', name: 'Week', frozen: true },
  { key: 'tanggal', name: 'Date', editor: DateEditor },
  { key: 'topik', name: 'Topic', editor: TextEditor },
  { 
    key: 'sub_cpmk_id', 
    name: 'Sub-CPMK',
    editor: (props) => (
      <SelectEditor 
        {...props} 
        options={getFilteredSubCPMKs(selectedCPMKs)} 
      />
    )
  },
  // ... more columns
];

const handleRowsChange = (rows) => {
  setPertemuanData(rows);
  debouncedSave(rows);
};
```

**Estimated Effort:** 8-12 hours

---

## 📊 Phase 6.3: Dashboard Analytics Enhancement

### Charts to Implement

#### 1. Grade Distribution (Bar Chart)
- X-axis: Grade letters (A, A-, B+, B, etc.)
- Y-axis: Count of students
- Filters: Course, Semester

#### 2. Attendance Trends (Line Chart)
- X-axis: Pertemuan
- Y-axis: Attendance %
- Multiple lines: Hadir, Izin, Sakit, Alpa

#### 3. CPL Attainment (Radar/Spider Chart)
- Each axis: CPL
- Value: Achievement %

#### 4. Class Performance Overview (Pie Chart)
- Segments: A (green), B (blue), C (yellow), D-E (red)

### Tech Stack
- **Charts:** Recharts (already familiar)
- **Data:** Aggregate from StudentGrade, FinalGrade, Attendance tables

### UI Layout

```
┌─────────────────────────────────────────┐
│ Dashboard - Semester Ganjil 2025/2026   │
├─────────────────────────────────────────┤
│ [Prodi ▼] [Semester ▼] [Tahun ▼]       │
├─────────┬───────────┬───────────────────┤
│ Total   │ Avg       │ Attendance        │
│ Students│ Grade     │ Rate              │
│ 1,234   │ 3.45      │ 87.5%            │
├─────────┴───────────┴───────────────────┤
│                                         │
│  Grade Distribution     Attendance      │
│  ▂▅▇▅▂                 ╱╲╱╲            │
│                                         │
├─────────────────────────────────────────┤
│  CPL Attainment (Radar)                │
│        ⬢                                │
│       ╱ ╲                               │
│                                         │
└─────────────────────────────────────────┘
```

**Estimated Effort:** 6-8 hours

---

## 📄 Phase 7.1: PDF RPS Export with Template

### Tech Stack
- **Option 1:** Puppeteer (HTML → PDF, full control)
- **Option 2:** PDFKit (Node.js PDF generation)
- **Recommendation:** Puppeteer for easier HTML templating

### Implementation

#### Backend

```javascript
import puppeteer from 'puppeteer';

export const exportRPSToPDF = async (req, res) => {
  const { rpsId } = req.params;
  const rps = await fetchFullRPS(rpsId); // with all relations
  
  const html = renderRPSTemplate(rps); // Use EJS or Handlebars
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });
  
  await browser.close();
  
  res.contentType('application/pdf');
  res.send(pdfBuffer);
};
```

#### Template (EJS)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { margin: 20mm; }
    body { font-family: Arial; font-size: 11pt; }
    .header { text-align: center; }
    .logo { width: 100px; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #000; padding: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <img src="<%= logoUrl %>" class="logo" />
    <h2><%= university %></h2>
    <h3>RENCANA PEMBELAJARAN SEMESTER</h3>
  </div>
  
  <table>
    <tr>
      <td>Mata Kuliah</td>
      <td><%= rps.mataKuliah.nama_mk %></td>
    </tr>
    <tr>
      <td>Kode MK</td>
      <td><%= rps.mataKuliah.kode_mk %></td>
    </tr>
    <!-- ... -->
  </table>
  
  <h4>Rincian Pertemuan</h4>
  <table>
    <thead>
      <tr>
        <th>Minggu</th>
        <th>Tanggal</th>
        <th>Topik</th>
        <th>Sub-CPMK</th>
      </tr>
    </thead>
    <tbody>
      <% rps.pertemuan.forEach(p => { %>
      <tr>
        <td><%= p.pertemuan_ke %></td>
        <td><%= p.tanggal %></td>
        <td><%= p.topik %></td>
        <td><%= p.subCPMK?.kode %></td>
      </tr>
      <% }); %>
    </tbody>
  </table>
</body>
</html>
```

### Customization
- Admin can upload logo
- Configure header text per prodi
- Signature placement (Kaprodi, Dekan)

**Estimated Effort:** 5-7 hours

---

## 📧 Phase 7.2: Email Notifications System

### Requirements
- Settings UI for admin/kaprodi
- Custom message templates with variables
- Bulk send to multiple recipients
- Notification types:
  - RPS approval/rejection
  - Grade submission
  - Low attendance warning

### Database Design

```sql
CREATE TABLE notification_settings (
  id SERIAL PRIMARY KEY,
  notification_type VARCHAR(50),  -- 'rps_approved', 'grade_submitted', etc.
  is_enabled BOOLEAN DEFAULT true,
  template_subject TEXT,
  template_body TEXT,  -- With placeholders: {{dosen_name}}, {{course_name}}, etc.
  created_by INT REFERENCES users(id)
);

CREATE TABLE notification_log (
  id SERIAL PRIMARY KEY,
  notification_type VARCHAR(50),
  recipient_email VARCHAR(255),
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMP,
  status ENUM('Sent', 'Failed')
);
```

### Backend (Nodemailer)

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendNotification = async (type, recipients, variables) => {
  const settings = await NotificationSettings.findOne({ 
    where: { notification_type: type, is_enabled: true } 
  });
  
  if (!settings) return;
  
  const subject = replaceVariables(settings.template_subject, variables);
  const body = replaceVariables(settings.template_body, variables);
  
  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html: body
      });
      
      await NotificationLog.create({ notification_type: type, recipient_email: email, subject, body, status: 'Sent' });
    } catch (error) {
      await NotificationLog.create({ notification_type: type, recipient_email: email, status: 'Failed' });
    }
  }
};

function replaceVariables(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] || match);
}
```

### Frontend UI

**Notification Settings Page** (`/admin/notifications`)

- List of notification types
- Toggle enable/disable
- Edit template modal with:
  - Subject field
  - Body rich text editor
  - Available variables: `{{dosen_name}}`, `{{course_name}}`, `{{mahasiswa_name}}`, etc.
  - Preview with sample data

**Bulk Send Modal**
- Target: Select users (Dosen, Mahasiswa, or custom list)
- Template selector
- Custom variables input
- Send button

**Estimated Effort:** 6-8 hours

---

## 👥 Phase 7.3: Multiple Roles per User

### Current State
User has single `role` field (ENUM)

### Target State
User has `roles` array (JSON or separate table)

### Database Migration

**Option A:** JSON Array (simpler)
```sql
ALTER TABLE users 
  DROP COLUMN role,
  ADD COLUMN roles JSON DEFAULT '["Dosen"]';
```

**Option B:** Many-to-Many (more flexible)
```sql
CREATE TABLE user_roles (
  user_id INT REFERENCES users(id),
  role VARCHAR(50),
  PRIMARY KEY(user_id, role)
);
```

**Recommendation:** Option A (JSON) for simplicity

### Backend Updates

```javascript
// Auth middleware update
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles; // Array
    const hasRole = userRoles.some(role => allowedRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### Frontend UI

**Role Switcher Component**

```jsx
const RoleSwitcher = () => {
  const user = useAuth();
  const [activeRole, setActiveRole] = useState(user.roles[0]);
  
  if (user.roles.length === 1) return null;
  
  return (
    <select value={activeRole} onChange={(e) => {
      setActiveRole(e.target.value);
      navigate(`/${e.target.value.toLowerCase()}/dashboard`);
    }}>
      {user.roles.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
};
```

**Estimated Effort:** 4-5 hours

---

## 📱 Phase 8.1: QR Code Attendance

### Flow
1. Dosen opens pertemuan → System generates QR code
2. Mahasiswa scans QR → Marks attendance as "Hadir"
3. Time window validation (e.g., only valid during class time ± 30 min)

### Backend

```javascript
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

export const generateAttendanceQR = async (req, res) => {
  const { pertemuanId } = req.params;
  
  // Create token with expiry
  const token = jwt.sign(
    { pertemuanId, type: 'attendance' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  
  const url = `${process.env.CLIENT_URL}/attendance/scan?token=${token}`;
  const qrImage = await QRCode.toDataURL(url);
  
  res.json({ qrImage, url });
};

export const scanAttendanceQR = async (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Mark attendance
    await Attendance.upsert({
      mahasiswa_id: req.user.id,
      rps_pertemuan_id: decoded.pertemuanId,
      status: 'Hadir',
      marked_at: new Date()
    });
    
    res.json({ message: 'Attendance marked!' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired QR code' });
  }
};
```

**Estimated Effort:** 4-5 hours

---

## 🎓 Phase 8.2: Mahasiswa Self-Service Portal

### Pages to Create

1. **Mahasiswa Dashboard** (`/mahasiswa/dashboard`)
   - Enrolled courses (current semester)
   - Upcoming classes
   - Recent grades
   - Attendance summary

2. **My Grades** (`/mahasiswa/grades`)
   - Course selector
   - Component grades table
   - Final grade display
   - GPA calculation

3. **My Attendance** (`/mahasiswa/attendance`)
   - Course selector
   - Attendance percentage
   - Per-pertemuan details
   - Warning if < 75%

4. **Course RPS** (`/mahasiswa/courses/:id/rps`)
   - View RPS document
   - Read-only mode

**Estimated Effort:** 8-10 hours

---

## 📈 Phase 6.4: CPL Achievement Analytics (COMPLEX - WAJIB)

### Concept

CPL achievement calculated from student performance on assessments linked to Sub-CPMKs, which roll up to CPMKs, which roll up to CPLs.

### Calculation Algorithm

```
For each Student:
  For each CPL:
    Get all Sub-CPMKs linked to this CPL's CPMKs
    For each Sub-CPMK:
      Get assessment components using this Sub-CPMK
      Get student's grade on these assessments
      Calculate weighted average
    Roll up Sub-CPMK scores to CPMK level
    Roll up CPMK scores to CPL level
  CPL Achievement % = (Student's CPL score / Max possible) × 100
```

### Implementation

```javascript
export const calculateCPLAchievement = async (mahasiswaId, prodiId, tahunAjaran) => {
  const cpls = await CPL.findAll({ where: { prodi_id: prodiId } });
  const results = [];
  
  for (const cpl of cpls) {
    // Get all CMPKs for this CPL
    const cpmks = await CPMK.findAll({ where: { cpl_id: cpl.id } });
    
    let totalScore = 0;
    let maxScore = 0;
    
    for (const cpmk of cpmks) {
      // Get Sub-CPMKs
      const subCPMKs = await SubCPMK.findAll({ where: { cpmk_id: cpmk.id } });
      
      for (const subCPMK of subCPMKs) {
        // Get assessments linked to this Sub-CPMK
        const components = await AssessmentComponent.findAll({
          where: { sub_cpmk_id: subCPMK.id, tahun_ajaran: tahunAjaran }
        });
        
        for (const component of components) {
          const grade = await StudentGrade.findOne({
            where: {
              mahasiswa_id: mahasiswaId,
              assessment_component_id: component.id
            }
          });
          
          if (grade) {
            const weight = component.component_type === 'legacy' ? component.legacy_weight : component.obe_weight;
            totalScore += (grade.nilai_angka * weight / 100);
            maxScore += weight;
          }
        }
      }
    }
    
    const achievement = maxScore > 0 ? (totalScore / maxScore) : 0;
    
    results.push({
      cpl_id: cpl.id,
      kode: cpl.kode,
      deskripsi: cpl.deskripsi,
      achievement: achievement.toFixed(2)
    });
  }
  
  return results;
};
```

### Analytics Dashboard

**Charts:**
1. **CPL Achievement Radar** (per student)
2. **Class CPL Average** (bar chart)
3. **CPL Trend Over Time** (line chart showing improvement)
4. **Sub-CPMK Heatmap** (identify weak areas)

**Estimated Effort:** 10-15 hours (COMPLEX)

---

## 🗓️ Implementation Order

### Week 1
1. ✅ Student Enrollment (CRITICAL - 6h)
2. ✅ Update Grading/Attendance to use real enrollment data (2h)

### Week 2
3. ✅ RPS Creation/Edit UI (12h)

### Week 3
4. ✅ Dashboard Analytics (8h)
5. ✅ CPL Achievement Analytics (15h) - MOVED TO PHASE 6

### Week 4
6. ✅ Multiple Roles (5h)
7. ✅ PDF Export (7h)

### Week 5
8. ✅ Email Notifications (8h)
9. ✅ Mahasiswa Portal (10h)

### Week 6
10. ✅ QR Attendance (5h)

**Total Estimated Effort:** ~90-100 hours

---

## 🚀 Next Steps

1. **Immediate:** Start with Student Enrollment (Phase 6.1)
2. **Review:** Get user approval on RPS UI mockup (Excel-like grid)
3. **Setup:** Install required packages (react-data-grid, puppeteer, nodemailer, qrcode)

**Ready to start?** Let's begin with Student Enrollment!
