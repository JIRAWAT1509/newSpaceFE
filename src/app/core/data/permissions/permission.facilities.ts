export const FACILITIES_TAB = {
  label: "Facilities Management",
  icon: "pi pi-building",
  items: [
    {
      MENU_ID: "0501",
      MenuName: "แจ้งซ่อม / เปิดงานซ่อม",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "050101",
          MenuName: "รายการแจ้งซ่อม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05010101",
              MenuName: "บันทึกแจ้งซ่อม / สร้างใบงานซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05010102",
              MenuName: "แก้ไขใบงานซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05010103",
              MenuName: "ยกเลิกใบงานซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050102",
          MenuName: "มอบหมายงานซ่อม / Dispatch",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05010201",
              MenuName: "มอบหมายช่าง / ทีมซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05010202",
              MenuName: "ปรับมอบหมาย / โอนงานซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        }
      ]
    },

    {
      MENU_ID: "0502",
      MenuName: "ซ่อมบำรุง / ติดตามสถานะงานซ่อม",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "050201",
          MenuName: "อัพเดตสถานะระหว่างซ่อม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05020101",
              MenuName: "เริ่มงานซ่อม / เข้าหน้างาน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05020102",
              MenuName: "กำลังดำเนินการซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05020103",
              MenuName: "พักงาน / รออะไหล่ / รออนุมัติค่าใช้จ่าย",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050202",
          MenuName: "ปิดงานซ่อม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05020201",
              MenuName: "บันทึกผลการซ่อมเสร็จ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05020202",
              MenuName: "แนบรูปก่อนซ่อม / หลังซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05020203",
              MenuName: "ยืนยันความเรียบร้อยโดยผู้แจ้งงาน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        }
      ]
    },

    {
      MENU_ID: "0503",
      MenuName: "ควบคุมงบประมาณ / ค่าใช้จ่ายซ่อมบำรุง",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "050301",
          MenuName: "บันทึก/อนุมัติค่าใช้จ่ายงานซ่อม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05030101",
              MenuName: "กรอกค่าแรง / ค่าอะไหล่ / วัสดุสิ้นเปลือง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05030102",
              MenuName: "อนุมัติค่าใช้จ่ายงานซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05030103",
              MenuName: "ไม่อนุมัติ / ตีกลับค่าใช้จ่าย",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050302",
          MenuName: "การเบิกอะไหล่ / วัสดุ",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05030201",
              MenuName: "ขอเบิกอะไหล่ / วัสดุซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05030202",
              MenuName: "อนุมัติการเบิกอะไหล่ / วัสดุ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05030203",
              MenuName: "ตัดสต็อกจากคลัง / บันทึกการจ่ายอะไหล่",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        }
      ]
    },

    {
      MENU_ID: "0504",
      MenuName: "การบำรุงรักษาเชิงป้องกัน (PM)",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "050401",
          MenuName: "แผนงานบำรุงรักษา (PM Plan)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05040101",
              MenuName: "กำหนดรอบ/ตาราง PM",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05040102",
              MenuName: "มอบหมายงาน PM ให้ช่าง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050402",
          MenuName: "บันทึกผล PM / สถานะอุปกรณ์",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05040201",
              MenuName: "เช็คสภาพ / ตรวจสอบอุปกรณ์ตามรอบ PM",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05040202",
              MenuName: "แจ้งซ่อมจากผล PM (สร้างใบงานซ่อมอัตโนมัติ)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        }
      ]
    },

    {
      MENU_ID: "0505",
      MenuName: "รายงาน / Dashboard งานซ่อมบำรุง",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "050501",
          MenuName: "รายงานสถานะงานซ่อม (Open / In Progress / Closed)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05050101",
              MenuName: "Dashboard งานซ่อมตามพื้นที่ / อาคาร / ชั้น",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05050102",
              MenuName: "รายงาน Backlog งานซ่อมค้างเกิน SLA",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050502",
          MenuName: "รายงานค่าใช้จ่ายซ่อมบำรุง",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05050201",
              MenuName: "สรุปค่าแรง / อะไหล่ / วัสดุสิ้นเปลืองตามเดือน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05050202",
              MenuName: "รายงานเทียบงบประมาณ vs ใช้จริง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "050503",
          MenuName: "ประสิทธิภาพทีมซ่อม / SLA",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "05050301",
              MenuName: "SLA Response Time / Resolution Time",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "05050302",
              MenuName: "อัตรางานซ้ำ / แจ้งซ่อมซ้ำจุดเดิม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        }
      ]
    }
  ]
};
