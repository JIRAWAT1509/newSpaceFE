export const CONTRACT_TAB = {
  label: "Contract",
  icon: "pi pi-file-signature",
  items: [
    {
      MENU_ID: "0301",
      MenuName: "ใบเสนอราคา",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030101",
          MenuName: "รายการประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03010101",
              MenuName: "ใบเสนอราคา",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03010102",
              MenuName: "ส่งใบเสนอราคา/ส่งให้ผู้เช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03010103",
              MenuName: "ยกเลิกใบเสนอราคา",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030102",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03010201",
              MenuName: "รายงานสถานะใบเสนอราคา",
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
      MENU_ID: "0302",
      MenuName: "โอนไปสัญญาจอง",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030201",
          MenuName: "ประมวลผลโอนใบเสนอราคาเป็นสัญญาจอง",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03020101",
              MenuName: "เลือกใบเสนอราคาที่อนุมัติแล้วเพื่อโอนเป็นสัญญาจอง",
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
      MENU_ID: "0303",
      MenuName: "สัญญาจอง",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030301",
          MenuName: "รายการประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03030101",
              MenuName: "สัญญาจอง (Booking Agreement)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03030102",
              MenuName: "อนุมัติสัญญาจอง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03030103",
              MenuName: "ยกเลิกสัญญาจอง / ไม่อนุมัติ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030302",
          MenuName: "การรับเงินมัดจำ/เงินจอง",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03030201",
              MenuName: "บันทึกรับเงินมัดจำ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03030202",
              MenuName: "คืนเงินมัดจำ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030303",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03030301",
              MenuName: "รายงานสถานะสัญญาจอง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03030302",
              MenuName: "รายงานการรับ/คืนเงินมัดจำ",
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
      MENU_ID: "0304",
      MenuName: "โอนไปสัญญาเช่า",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030401",
          MenuName: "ประมวลผลโอนสัญญาจองเป็นสัญญาเช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03040101",
              MenuName: "เลือกสัญญาจองที่อนุมัติแล้วเพื่อสร้างสัญญาเช่า",
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
      MENU_ID: "0305",
      MenuName: "สัญญาเช่า",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030501",
          MenuName: "รายการประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03050101",
              MenuName: "สัญญาเช่าพื้นที่ (Rental Contract)",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03050102",
              MenuName: "อนุมัติสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03050103",
              MenuName: "ยกเลิก/ไม่อนุมัติสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030502",
          MenuName: "ปรับปรุง/ต่ออายุสัญญาเช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03050201",
              MenuName: "ต่ออายุสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03050202",
              MenuName: "ปรับอัตราค่าเช่า / ปรับเงื่อนไข",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030503",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03050301",
              MenuName: "รายงานสถานะสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03050302",
              MenuName: "รายงานสัญญาเช่าที่ใกล้ครบกำหนด",
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
      MENU_ID: "0306",
      MenuName: "เอกสารสัญญาเช่า",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030601",
          MenuName: "จัดการเอกสารแนบสัญญาเช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03060101",
              MenuName: "อัปโหลด/แก้ไขเอกสารสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03060102",
              MenuName: "ตรวจสอบความครบถ้วนเอกสาร",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030602",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03060201",
              MenuName: "รายงานสถานะเอกสารสัญญาเช่า",
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
      MENU_ID: "0307",
      MenuName: "ยกเลิกสัญญาเช่า",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030701",
          MenuName: "การยกเลิกสัญญาเช่า",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03070101",
              MenuName: "คำขอยกเลิกสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03070102",
              MenuName: "อนุมัติยกเลิกสัญญาเช่า",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03070103",
              MenuName: "ไม่อนุมัติ / ยกเลิกการยกเลิก",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030702",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03070201",
              MenuName: "รายงานสัญญาเช่าที่ถูกยกเลิก",
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
      MENU_ID: "0308",
      MenuName: "โปรโมชั่น / ส่วนลด",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030801",
          MenuName: "กำหนดโปรโมชั่น",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03080101",
              MenuName: "สร้าง/แก้ไขโปรโมชั่น",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03080102",
              MenuName: "อนุมัติโปรโมชั่น",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030802",
          MenuName: "รายงานโปรโมชั่น",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03080201",
              MenuName: "รายงานโปรโมชั่นที่ใช้งานอยู่",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03080202",
              MenuName: "รายงานผลกระทบส่วนลดกับรายได้",
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
      MENU_ID: "0309",
      MenuName: "สัญญาตกแต่ง / Renovation",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "030901",
          MenuName: "สัญญาตกแต่งพื้นที่",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03090101",
              MenuName: "ออกสัญญาตกแต่ง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03090102",
              MenuName: "อนุมัติสัญญาตกแต่ง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "03090103",
              MenuName: "ยกเลิก/ไม่อนุมัติสัญญาตกแต่ง",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },
        {
          MENU_ID: "030902",
          MenuName: "รายงาน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "03090201",
              MenuName: "รายงานสถานะสัญญาตกแต่ง",
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
