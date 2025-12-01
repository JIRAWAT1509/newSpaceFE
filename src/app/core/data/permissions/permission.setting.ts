export const SETTING_TAB = {
  label: "Setting",
  icon: "pi pi-cog",
  items: [
    {
      MENU_ID: "0701",
      MenuName: "ผู้ใช้งานและสิทธิ์การเข้าใช้งานระบบ",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "070101",
          MenuName: "ผู้ใช้งาน (User Management)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07010101",
              MenuName: "สร้าง/แก้ไขผู้ใช้งาน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07010102",
              MenuName: "ระงับการใช้งาน / ปลดระงับ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07010103",
              MenuName: "รีเซ็ตรหัสผ่าน / การตั้งค่าการเข้าสู่ระบบ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070102",
          MenuName: "บทบาทและสิทธิ์ (Role & Permission)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07010201",
              MenuName: "กำหนดสิทธิ์ตามบทบาท (Role Permission Matrix)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07010202",
              MenuName: "จัดการเทมเพลตสิทธิ์ (Permission Template)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07010203",
              MenuName: "คัดลอกสิทธิ์จากบทบาทอื่น / Apply Template",
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
      MENU_ID: "0702",
      MenuName: "ข้อมูลหลัก (Master Data)",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "070201",
          MenuName: "โครงสร้างพื้นที่เช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07020101",
              MenuName: "ประเภทพื้นที่ / Zone / ประเภทการใช้งาน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07020102",
              MenuName: "ประเภทสัญญา (เช่า / จอง / ตกแต่ง ฯลฯ)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07020103",
              MenuName: "กลุ่มอัตราค่าเช่า / รูปแบบคิดค่าเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070202",
          MenuName: "ข้อมูลผู้เช่า / ลูกค้า / คู่สัญญา",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07020201",
              MenuName: "สร้าง/แก้ไขข้อมูลผู้เช่า/ผู้ติดต่อ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07020202",
              MenuName: "จัดการสถานะลูกค้า (Active / Blacklist / Closed)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070203",
          MenuName: "การเงินพื้นฐาน (ค่าเริ่มต้นด้านการเงิน)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07020301",
              MenuName: "กำหนด VAT / ภาษีหัก ณ ที่จ่าย / เงื่อนไขเก็บเงิน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07020302",
              MenuName: "ผังบัญชีอ้างอิง / รหัสบัญชีต้นทาง",
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
      MENU_ID: "0703",
      MenuName: "การตั้งค่า Workflow อนุมัติ",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "070301",
          MenuName: "Workflow ด้านสัญญาเช่า / เอกสารเชิงธุรกิจ",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07030101",
              MenuName: "อนุมัติใบเสนอราคา / สัญญาจอง / สัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07030102",
              MenuName: "อนุมัติการต่อสัญญาเช่า / ปรับอัตราค่าเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07030103",
              MenuName: "อนุมัติยกเลิกสัญญาเช่า / ยกเลิกสัญญาตกแต่ง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070302",
          MenuName: "Workflow งานซ่อมบำรุง / PM / ค่าใช้จ่ายซ่อม",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07030201",
              MenuName: "อนุมัติใบงานซ่อม / มอบหมายช่าง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07030202",
              MenuName: "อนุมัติค่าใช้จ่ายงานซ่อม / อะไหล่ / วัสดุ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07030203",
              MenuName: "อนุมัติแผน PM / ตาราง PM",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070303",
          MenuName: "Workflow การเงิน / เอกสารการเงิน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07030301",
              MenuName: "อนุมัติใบเสร็จรับเงิน / การลงรับชำระ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07030302",
              MenuName: "อนุมัติใบลดหนี้ / ใบเพิ่มหนี้",
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
      MENU_ID: "0704",
      MenuName: "รูปแบบเอกสาร / เลขที่เอกสาร / Template พิมพ์",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "070401",
          MenuName: "เลขที่เอกสาร (Running Number)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07040101",
              MenuName: "กำหนดรูปแบบเลขที่ใบเสนอราคา / สัญญาจอง / สัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07040102",
              MenuName: "กำหนดรูปแบบเลขที่ใบเสร็จ / ใบลดหนี้ / ใบเพิ่มหนี้",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070402",
          MenuName: "Template เอกสาร",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07040201",
              MenuName: "Template สัญญาเช่า / สัญญาจอง / สัญญาตกแต่ง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07040202",
              MenuName: "Template ใบเสนอราคา / ใบเสร็จรับเงิน / หนังสือแจ้งเตือน",
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
      MENU_ID: "0705",
      MenuName: "Integration / Parameter ระบบ",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "070501",
          MenuName: "การเชื่อมต่อระบบภายนอก",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07050101",
              MenuName: "ตั้งค่าเชื่อมต่อระบบบัญชี / ERP / SAP / GL",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07050102",
              MenuName: "ตั้งค่าการส่งข้อมูลยอดขาย / รายได้เช่า / ค่าใช้จ่ายซ่อม",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "070502",
          MenuName: "พารามิเตอร์ระบบ (System Parameter)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "07050201",
              MenuName: "กำหนดค่าทั่วไปของระบบ (เช่น วันตัดรอบ, SLA, Grace Period ชำระเงิน)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "07050202",
              MenuName: "กำหนดสิทธิ์ฟังก์ชันพิเศษ / Feature Flag",
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
