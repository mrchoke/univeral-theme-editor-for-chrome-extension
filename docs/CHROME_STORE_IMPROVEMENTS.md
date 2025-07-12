# การแก้ไข Extension สำหรับ Google Chrome Store

## สรุปการเปลี่ยนแปลง

### 1. ลบปุ่ม Toggle ที่ลอยบนหน้าเว็บ
- ลบฟังก์ชัน `createToggleButton()` จาก `ui-components.js`
- ลบการเรียกใช้ `createToggleButton()` จาก `main.js`
- ปุ่มที่ลอยบนหน้าเว็บถูกลบออกทั้งหมดเพื่อให้เป็นไปตามมาตรฐานของ Chrome Web Store

### 2. เพิ่มการเปิด Theme Editor ผ่าน Extension Button
- เพิ่ม `action` ใน `manifest.json` สำหรับ popup
- สร้าง `popup.html` - หน้า popup สวยงามเมื่อคลิกปุ่ม extension
- สร้าง `popup.js` - จัดการการเปิด Theme Editor จาก popup
- เพิ่ม `background.js` - service worker สำหรับจัดการ communication

### 3. เพิ่ม Context Menu (คลิกขวา)
- เพิ่ม permission `contextMenus` ใน `manifest.json`
- สร้าง context menu "Open Theme Editor" ใน `background.js`
- เมื่อคลิกขวาบนหน้าเว็บจะมีตัวเลือก "Open Theme Editor"

### 4. การสื่อสารระหว่าง Extension Components
- เพิ่มฟังก์ชัน `setupMessageListener()` ใน `main.js`
- รองรับการรับ message จาก popup และ context menu
- ใช้ `chrome.runtime.sendMessage()` และ `chrome.tabs.sendMessage()` สำหรับการสื่อสาร

## ไฟล์ที่เพิ่มใหม่
1. `background.js` - Service worker สำหรับ context menu และ communication
2. `popup.html` - UI popup เมื่อคลิกปุ่ม extension
3. `popup.js` - Logic สำหรับ popup

## ไฟล์ที่แก้ไข
1. `manifest.json` - เพิ่ม action, background, permissions
2. `js/main.js` - ลบการสร้างปุ่ม toggle, เพิ่ม message listener
3. `js/ui-components.js` - ลบฟังก์ชัน createToggleButton
4. `README.md` - อัปเดตวิธีการใช้งาน

## วิธีการใช้งานใหม่
1. **จากปุ่ม Extension**: คลิกที่ไอคอน extension บน toolbar แล้วคลิก "Open Theme Editor"
2. **จาก Context Menu**: คลิกขวาบนหน้าเว็บแล้วเลือก "Open Theme Editor"

## ข้อดี
- ✅ ไม่มีปุ่มลอยบนหน้าเว็บ (Chrome Store Compliant)
- ✅ การเข้าถึงผ่าน Extension UI มาตรฐาน
- ✅ สะดวกในการเข้าถึงผ่าน Context Menu
- ✅ ประสบการณ์ผู้ใช้ที่ดีขึ้น
- ✅ เป็นไปตามแนวทางของ Chrome Web Store
