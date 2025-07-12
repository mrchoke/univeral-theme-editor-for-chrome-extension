# Universal Dynamic Theme Editor

## โครงสร้างไฟล์ (File Structure)

### การแยกไฟล์ใหม่ (New Modular Structure)

เดิมที่ `content_script.js` มีขนาดใหญ่ถึง 2,729 บรรทัด ตอนนี้ได้แยกออกเป็นไฟล์ย่อยต่างๆ ตามหน้าที่การทำงาน:

```
js/
├── globals.js              # ตัวแปรส่วนกลางและฟังก์ชันพื้นฐาน
├── ui-components.js        # ส่วนประกอบ UI (Toggle button, Toolbox)
├── element-handlers.js     # การจัดการเลือกและจัดการ elements
├── style-applier.js        # การประยุกต์และจัดการ CSS styles
├── event-listeners.js      # Event listeners สำหรับ toolbox
├── toolbox-populators.js   # การเติมข้อมูลในฟอร์ม toolbox
├── options-panel.js        # Options panel และ dialogs
└── main.js                # การเริ่มต้นและรวบรวมทุกอย่าง
```

### รายละเอียดแต่ละไฟล์

#### 1. `globals.js`
- ตัวแปรส่วนกลาง (`activeElement`, `cssRules`, `originalValues` ฯลฯ)
- ฟังก์ชันพื้นฐาน (`debugLog`, `saveState`, `loadState`)
- ฟังก์ชันยูทิลิตี้ (`generateSelector`, `extractNumericValue`, `isImageElement`)

#### 2. `ui-components.js` 
- การสร้าง Toggle button (🎨)
- การสร้าง Toolbox UI
- ฟังก์ชัน `makeDraggable`
- HTML templates

#### 3. `element-handlers.js`
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

## ประโยชน์ของการแยกไฟล์

### 🚀 ประสิทธิภาพ (Performance)
- **โหลดเร็วขึ้น**: แต่ละไฟล์มีขนาดเล็กลง ประมวลผลเร็วขึ้น
- **ใช้หน่วยความจำน้อยลง**: JavaScript engine จัดการโค้ดแยกได้ดีกว่า
- **ลดการ blocking**: การโหลดหลายไฟล์เล็กดีกว่าไฟล์ใหญ่ไฟล์เดียว

### 🛠️ การบำรุงรักษา (Maintainability)
- **แยกหน้าที่ชัดเจน**: แต่ละไฟล์มีหน้าที่เฉพาะ
- **แก้ไขง่าย**: หาส่วนที่ต้องแก้ไขได้เร็ว
- **ลดข้อผิดพลาด**: โค้ดมีโครงสร้างชัดเจน

### 🔧 การพัฒนา (Development)
- **ทำงานร่วมกันได้**: หลายคนแก้ไขไฟล์ต่างกันได้
- **ทดสอบง่าย**: ทดสอบแต่ละส่วนแยกกัน
- **เพิ่มฟีเจอร์ใหม่ง่าย**: สามารถเพิ่มไฟล์ใหม่ได้

## การใช้งาน

1. **ติดตั้ง**: โหลด extension ใน Chrome/Edge Developer Mode
2. **เริ่มใช้งาน**: คลิกปุ่ม 🎨 ที่มุมขวาล่าง
3. **แก้ไข**: ใช้ Alt + Click เลือก element และปรับแต่ง
4. **ส่งออก**: Export CSS เมื่อเสร็จสิ้น

## การสำรองข้อมูล

ไฟล์เดิม `content_script.js` ได้ถูกเปลี่ยนชื่อเป็น `content_script.js.backup` เพื่อความปลอดภัย

## หมายเหตุสำหรับนักพัฒนา

- ไฟล์จะถูกโหลดตามลำดับใน `manifest.json`
- `globals.js` ต้องโหลดก่อนเสมอ เพราะมีตัวแปรที่ไฟล์อื่นใช้
- `main.js` ต้องโหลดหลังสุด เพราะเป็นตัวเริ่มต้นโปรแกรม
