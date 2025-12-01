export const REPORT_DASHBOARD_TAB = {
  label: "Report and Dashboard",
  icon: "pi pi-chart-bar",
  items: [
    {
      MENU_ID: "0601",
      MenuName: "Dashboard ธุรกิจภาพรวม",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "060101",
          MenuName: "ภาพรวมพื้นที่เช่า / Occupancy",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06010101",
              MenuName: "อัตราการเช่าพื้นที่ (Occupancy Rate)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010102",
              MenuName: "พื้นที่ว่าง / พื้นที่กำลังเปิดขาย",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010103",
              MenuName: "สรุปรายได้ตามพื้นที่เช่า (พื้นที่ไหนทำเงินเท่าไหร่)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060102",
          MenuName: "ยอดขายและรายได้ค่าเช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06010201",
              MenuName: "รายได้ค่าเช่ารายเดือน / รายไตรมาส",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010202",
              MenuName: "ยอดขายจากผู้เช่า (ยอดขายร้านค้า)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010203",
              MenuName: "Top Tenant / Top Product Contributors",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060103",
          MenuName: "สถานะเรียกเก็บเงิน / ค้างชำระ (Collection)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06010301",
              MenuName: "Aging รายการค้างชำระ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010302",
              MenuName: "ลูกหนี้ค้างชำระตามสัญญาเช่า / ร้านค้า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010303",
              MenuName: "แนวโน้มการเก็บหนี้ (Collection Performance)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060104",
          MenuName: "สถานะงานซ่อมและบำรุงรักษา (Facilities)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06010401",
              MenuName: "จำนวนงานซ่อมเปิดอยู่ / งานค้าง / ปิดแล้ว",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010402",
              MenuName: "SLA การซ่อม (Response / Resolve Time)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06010403",
              MenuName: "ค่าใช้จ่ายซ่อมบำรุงเทียบงบประมาณ",
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
      MENU_ID: "0602",
      MenuName: "KPI และ Performance Monitoring",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "060201",
          MenuName: "KPI ด้านพื้นที่ / Occupancy / Yield",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06020101",
              MenuName: "ค่าเช่าต่อพื้นที่ (Rental Yield per SQM)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06020102",
              MenuName: "อัตราการต่อสัญญาเช่า / ต่ออายุสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06020103",
              MenuName: "อัตราการยกเลิกสัญญาเช่าก่อนกำหนด",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060202",
          MenuName: "KPI ด้าน Collection / Cashflow In",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06020201",
              MenuName: "เปอร์เซ็นต์การเก็บเงินตรงเวลา",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06020202",
              MenuName: "ยอดค้างชำระเกิน SLA",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060203",
          MenuName: "KPI ด้านงานซ่อมและ PM",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06020301",
              MenuName: "งาน PM ที่เสร็จตามแผน / เลท",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06020302",
              MenuName: "Recurring Issue (ปัญหาเดิมเกิดซ้ำ)",
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
      MENU_ID: "0603",
      MenuName: "วิเคราะห์ / คาดการณ์ (Analysis & Forecast)",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "060301",
          MenuName: "ประมาณการรายได้พื้นที่เช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06030101",
              MenuName: "คาดการณ์รายได้จากพื้นที่ว่างปัจจุบันถ้าปล่อยเช่าได้",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06030102",
              MenuName: "ผลกระทบจากโปรโมชั่น / ส่วนลดค่าเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060302",
          MenuName: "คาดการณ์กระแสเงินสดรับ (Cash In Forecast)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06030201",
              MenuName: "ประมาณการรับชำระตามสัญญาเช่าในอนาคต",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06030202",
              MenuName: "วิเคราะห์ความเสี่ยงการค้างชำระ",
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
      MENU_ID: "0604",
      MenuName: "Export / Executive Report",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "060401",
          MenuName: "รายงานผู้บริหาร (Executive Pack)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06040101",
              MenuName: "สรุปภาพรวมธุรกิจประจำเดือน (PDF/Excel)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06040102",
              MenuName: "สรุปประเด็นเสี่ยง / จุดที่ต้องตัดสินใจ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "060402",
          MenuName: "Export ข้อมูลดิบ",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "06040201",
              MenuName: "Export ข้อมูลสัญญาเช่า / ผู้เช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06040202",
              MenuName: "Export ยอดค้างชำระ / การรับชำระ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "06040203",
              MenuName: "Export สถานะงานซ่อม / PM / SLA",
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
