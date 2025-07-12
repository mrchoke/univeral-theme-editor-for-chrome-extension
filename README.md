# Universal Dynamic Theme Editor
## การใช้งาน

1. **ติดตั้ง**: โหลด extension ใน Chrome/Edge Developer Mode โดยการ Clone repository นี้ [Github](https://github.com/mrchoke/universal-theme-editor-for-chrome-extension.git) ไปยังเครื่องของคุณ
2. **เริ่มใช้งาน**:
   - คลิกที่ไอคอน extension (ED) บน Chrome Toolbar แล้วกดปุ่ม "Open Theme Editor"
   - หรือคลิกขวาบนหน้าเว็บแล้วเลือก "Open Theme Editor" จาก context menu
3. **แก้ไข**: ใช้ Alt(Option) + Click เลือก element และปรับแต่ง
4. **ส่งออก**: Export CSS เมื่อเสร็จสิ้น
5. **ล้างข้อมูล**: ใช้ปุ่ม "Clear Current Page Styles" และ  "Clear All Saved Styles" เพื่อล้างการปรับแต่งทั้งหมดก่อนจะทดสอบ CSS ที่คุณได้ทำไว้บนหน้าเว็บจริง

### การแยกไฟล์ใหม่ (New Modular Structure)

### โครงสร้างไฟล์หลัก

```
manifest.json              # Chrome Extension manifest
css/
└── styles.css             # Styles สำหรับ popup และ toolbox
html/
└── popup.html             # Popup UI เมื่อคลิก extension button
js/
├── background.js          # Service worker สำหรับ context menu และสื่อสารกับ content script
├── globals.js             # ตัวแปรส่วนกลางและฟังก์ชันพื้นฐาน
├── ui-components.js       # ส่วนประกอบ UI (Toolbox, Templates, makeDraggable)
├── element-handlers.js    # การจัดการเลือกและจัดการ elements
├── style-applier.js       # การประยุกต์และจัดการ CSS styles
├── event-listeners.js     # Event listeners สำหรับ toolbox
├── toolbox-populators.js  # การเติมข้อมูลในฟอร์ม toolbox
├── options-panel.js       # Options panel และ dialogs
├── main.js                # การเริ่มต้นและรวบรวมทุกอย่าง, message listener
└── popup.js               # Logic สำหรับ popup

```

#### 1. `globals.js`
- ตัวแปรส่วนกลาง (`activeElement`, `cssRules`, `originalValues` ฯลฯ)
- ฟังก์ชันพื้นฐาน (`debugLog`, `saveState`, `loadState`)
- ฟังก์ชันยูทิลิตี้ (`generateSelector`, `extractNumericValue`, `isImageElement`)

#### 2. `ui-components.js` 
- การสร้าง Toolbox UI
#### 2. `ui-components.js`
- การสร้าง Toolbox UI (ไม่มีปุ่มลอย)
- ฟังก์ชัน `makeDraggable` สำหรับการลากย้าย toolbox
- HTML templates

#### 3. `background.js`
- สร้าง context menu (คลิกขวา) และสื่อสารกับ content script

#### 4. `popup.html` & `popup.js`
- UI และ logic สำหรับ popup เมื่อคลิก extension button

#### 5. `main.js`
- การเริ่มต้นโปรแกรม, message listener สำหรับรับคำสั่งเปิด options panel

#### 6. `element-handlers.js`, `style-applier.js`, `event-listeners.js`, `toolbox-populators.js`, `options-panel.js`
- เหมือนเดิม (ดูรายละเอียดในไฟล์)
- การจัดการการเลือก element (`handleElementSelection`)
- การสร้าง element hierarchy
- การ reset และ undo สำหรับ elements

#### 4. `style-applier.js`
- การประยุกต์ CSS styles (`applyStyle`)
- การ export CSS
- การลบ styles (clear functions)

#### 5. `event-listeners.js`
- Event listeners สำหรับ toolbox controls
- การจัดการ input events
- การจัดการ border, padding, margin controls
- **Gradient background controls** - การควบคุม linear gradient
- **Shadow controls** - text-shadow และ box-shadow พร้อมการคำนวณมุมและระยะทาง

#### 6. `toolbox-populators.js`
- การเติมข้อมูลใน toolbox forms
- การแสดงค่าปัจจุบันของ elements
- การจัดการ visibility ของ controls

#### 7. `options-panel.js`
- การสร้างและจัดการ options panel
- About dialog และ instructions
- Statistics และการจัดการข้อมูล

#### 8. `main.js`
- การเริ่มต้นโปรแกรม
- การโหลดตาม DOM ready state


## หมายเหตุสำหรับนักพัฒนา

- ไฟล์จะถูกโหลดตามลำดับใน `manifest.json`
- `globals.js` ต้องโหลดก่อนเสมอ เพราะมีตัวแปรที่ไฟล์อื่นใช้
- `main.js` ต้องโหลดหลังสุด เพราะเป็นตัวเริ่มต้นโปรแกรม

## ฟีเจอร์ใหม่ล่าสุด

### 🎨 Gradient Background Controls
- **Checkbox toggle**: เปิด/ปิดโหมด gradient
- **Color 1 & 2**: เลือกสีที่หนึ่งและสองสำหรับ gradient
- **Direction slider**: ควบคุมทิศทาง 0-360 องศา
- **Position slider**: ควบคุมตำแหน่งการผสมสี 0-100%
- **Real-time preview**: ดูผลลัพธ์ทันทีขณะปรับแต่ง

### 🌟 Shadow Effects
- **Text Shadow**: เพิ่มเงาให้กับข้อความ
- **Box Shadow**: เพิ่มเงาให้กับกล่อง element
- **แบบครบครัน**: ควบคุมสี, ระยะทาง, ทิศทาง, และ blur
- **มุมกับระยะทาง**: ใช้ slider เลือกมุม 0-360° และระยะทางเป็น pixel
- **Default values**: ตั้งเงาไปทางมุมขวาล่าง (135°) สีดำ

### 🖥️ Cross-Platform Compatibility
- **Smart modifier key detection**: แสดง "Option" บน macOS, "Alt" บน Windows/Linux
- **User-friendly interface**: ข้อความปรับเปลี่ยนตามระบบปฏิบัติการ

### 🛠️ UI/UX Improvements
- **Resizable dialogs**: ปรับขนาด options dialog และ toolbox ได้
- **Drag prevention**: แก้ไขปัญหา dialog ปิดตัวเองเวลา resize
- **Export button visibility**: แก้ไขปัญหาปุ่ม Export CSS หายไป
- **Better event handling**: ป้องกัน infinite recursion และ performance issues
