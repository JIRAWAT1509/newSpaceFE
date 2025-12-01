export const COLLECTION_FINANCE_TAB = {
  label: "Collection and Finance",
  icon: "pi pi-wallet",
  items: [
    {
      MENU_ID: "0401",
      MenuName: "Collection",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "040101",
          MenuName: "การบันทึกยอดขายประจำวัน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04010101",
              MenuName: "รายการประจำวัน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: [
                {
                  MENU_ID: "0401010101",
                  MenuName: "ยอดขายประจำวันสำหรับการเงิน",
                  Level: 4,
                  isEnabled: false,
                  isViewOnly: false,
                  children: []
                },
                {
                  MENU_ID: "0401010102",
                  MenuName: "ยอดขายประจำวันสำหรับบัญชี",
                  Level: 4,
                  isEnabled: false,
                  isViewOnly: false,
                  children: []
                }
              ]
            },
            {
              MENU_ID: "04010102",
              MenuName: "บันทึกยอดขายประจำวัน / แก้ไข",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04010103",
              MenuName: "อนุมัติยอดขายประจำวัน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04010104",
              MenuName: "ไม่อนุมัติยอดขายประจำวัน / ยกเลิกการอนุมัติ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },

        {
          MENU_ID: "040102",
          MenuName: "การเรียกเก็บเงิน / การรับชำระ",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04010201",
              MenuName: "การค้างชำระ / ติดตามการชำระเงิน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04010202",
              MenuName: "ลงบันทึกรับชำระ / ยืนยันการชำระ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },

        {
          MENU_ID: "040103",
          MenuName: "รายงาน (Collection)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04010301",
              MenuName: "รายงานยอดขายประจำวัน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04010302",
              MenuName: "รายงานค้างชำระ",
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
      MENU_ID: "0402",
      MenuName: "Finance",
      Level: 1,
      isEnabled: false,
      isViewOnly: false,
      children: [
        {
          MENU_ID: "040201",
          MenuName: "การจัดทำใบเสร็จรับเงิน",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04020101",
              MenuName: "รายการประจำวัน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: [
                {
                  MENU_ID: "0402010101",
                  MenuName: "ใบเสร็จรับเงิน (อ้างถึงใบแจ้งหนี้)",
                  Level: 4,
                  isEnabled: false,
                  isViewOnly: false,
                  children: []
                },
                {
                  MENU_ID: "0402010102",
                  MenuName: "ใบเสร็จรับเงิน (อิสระ/ไม่ผูกใบแจ้งหนี้)",
                  Level: 4,
                  isEnabled: false,
                  isViewOnly: false,
                  children: []
                }
              ]
            },
            {
              MENU_ID: "04020102",
              MenuName: "แก้ไข/ยกเลิกใบเสร็จรับเงิน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },

        {
          MENU_ID: "040202",
          MenuName: "ใบลดหนี้ / ใบเพิ่มหนี้",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04020201",
              MenuName: "ออกใบลดหนี้",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04020202",
              MenuName: "ออกใบเพิ่มหนี้",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04020203",
              MenuName: "ยกเลิกใบลดหนี้ / ใบเพิ่มหนี้",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },

        {
          MENU_ID: "040203",
          MenuName: "การกระทบยอด / ปรับปรุงบัญชี",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04020301",
              MenuName: "กระทบยอดการรับชำระ",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04020302",
              MenuName: "บันทึกรายการปรับปรุงทางบัญชี",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            }
          ]
        },

        {
          MENU_ID: "040204",
          MenuName: "รายงาน (Finance)",
          Level: 2,
          isEnabled: false,
          isViewOnly: false,
          children: [
            {
              MENU_ID: "04020401",
              MenuName: "รายงานใบเสร็จรับเงิน",
              Level: 3,
              isEnabled: false,
              isViewOnly: false,
              children: []
            },
            {
              MENU_ID: "04020402",
              MenuName: "รายงานปรับปรุงบัญชี / กระทบยอด",
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
