export const AREA_TAB = {
  label: "Area",
  icon: "pi pi-map",
  items: [
    {
      MENU_ID: "0201",
      MenuName: "กำหนดผังพื้นที่",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "020101",
          MenuName: "ข้อมูลหลัก",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02010101", MenuName: "อาคาร", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010102", MenuName: "ชั้น", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010103", MenuName: "บริเวณพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010104", MenuName: "ผังพื้นที่ให้เช่า", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010105", MenuName: "บันทึกผังพื้นที่ให้เช่า", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010106", MenuName: "Price List", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010107", MenuName: "ผังพื้นที่ให้เช่า-review", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        },
        {
          MENU_ID: "020102",
          MenuName: "สอบถาม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02010201", MenuName: "ตรวจสอบสถานะพื้นที่เช่า", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010202", MenuName: "สอบถามพื้นที่ว่าง", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010203", MenuName: "ตรวจสอบผังพื้นที่ให้เช่า", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        },
        {
          MENU_ID: "020103",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02010301", MenuName: "รายงานตรวจสอบพื้นที่ให้เช่า", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02010302", MenuName: "รายงานผังพื้นที่ให้เช่าปัจจุบัน", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        }
      ]
    },
    {
      MENU_ID: "0202",
      MenuName: "การแจ้งปิดปรับปรุงพื้นที่",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "020201",
          MenuName: "รายการประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02020101", MenuName: "ใบปิดปรับปรุงพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02020102", MenuName: "อนุมัติการปิดปรับปรุงพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02020103", MenuName: "ยกเลิกอนุมัติและไม่อนุมัติการปิดปรับปรุงพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        },
        {
          MENU_ID: "020202",
          MenuName: "ประมวลผล",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02020201", MenuName: "ปิดปรับปรุงพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] },
            { MENU_ID: "02020202", MenuName: "เปิดใช้งานพื้นที่ปิดปรับปรุง", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        },
        {
          MENU_ID: "020203",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02020301", MenuName: "รายงานใบแจ้งปิดปรับปรุงพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        }
      ]
    },
    {
      MENU_ID: "0203",
      MenuName: "การวัดพื้นที่",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "020301",
          MenuName: "รายการประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02030101", MenuName: "การวัดพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        },
        {
          MENU_ID: "020302",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            { MENU_ID: "02030201", MenuName: "รายงานรายละเอียดการวัดพื้นที่", Level: 3, isEnabled: false, isViewOnly: false, children: [] }
          ]
        }
      ]
    }
  ]
};
