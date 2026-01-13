// src/app/core/services/contract-mapping.service.ts
import { Injectable } from '@angular/core';
import { Contract } from '@core/models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractMappingService {

  mapToGeneralDetailsForm(contract: Contract): any {
    return {
      branch: contract.BRANCH_CODE,
      contractType: contract.CONTRACT_TYPE_CODE,
      contractNumberMain: contract.CONTRACT_NUMBER_MAIN || '',
      contractNumberSub: contract.CONTRACT_NUMBER_SUB || '',
      quotationStatus: contract.QUOTATION_STATUS || '',
      contractDate: contract.CONTRACT_DATE,
      recordDate: contract.RECORD_DATE || '',
      approvalDate: contract.APPROVAL_DATE || '',
      intentionLetter: contract.INTENTION_LETTER || '',
      transferToBooking: contract.TRANSFER_TO_BOOKING || '',
      contractLocation: contract.CONTRACT_LOCATION,
      headOfficeAddress: contract.HEAD_OFFICE_ADDRESS,
      representative: contract.REPRESENTATIVE,
      branchAddress: contract.BRANCH_ADDRESS || '',
      contactPerson: contract.CONTACT_PERSON || '',
      contactAddressType: contract.CONTACT_ADDRESS_TYPE || 'headOffice',
      contactAddress: contract.CONTACT_ADDRESS || '',
      customerId: contract.CUSTOMER_ID,
      documentAddress: contract.DOCUMENT_ADDRESS || '',
      billingAddress: contract.BILLING_ADDRESS || '',
      companyName: contract.COMPANY_NAME || '',
      authorizedPerson1: contract.AUTHORIZED_PERSON_1,
      phone1: contract.PHONE_1,
      position1: contract.POSITION_1,
      authorizedPerson2: contract.AUTHORIZED_PERSON_2 || '',
      phone2: contract.PHONE_2 || '',
      position2: contract.POSITION_2 || '',
      subCategory: contract.SUB_CATEGORY,
      category: contract.CATEGORY || '',
      profitCenter: contract.PROFIT_CENTER || '',
      businessName: contract.BUSINESS_NAME || '',
      productCategory: contract.PRODUCT_CATEGORY || '',
      productType1: contract.PRODUCT_TYPE_1 || '',
      productType2: contract.PRODUCT_TYPE_2 || '',
      productType3: contract.PRODUCT_TYPE_3 || '',
      productType4: contract.PRODUCT_TYPE_4 || '',
      productType5: contract.PRODUCT_TYPE_5 || '',
      productType6: contract.PRODUCT_TYPE_6 || '',
      provider1: contract.PROVIDER_1 || '',
      providerPosition1: contract.PROVIDER_POSITION_1 || '',
      provider2: contract.PROVIDER_2 || '',
      providerPosition2: contract.PROVIDER_POSITION_2 || '',
      witness1: contract.WITNESS_1 || '',
      witness2: contract.WITNESS_2 || '',
      contractCreator: contract.CONTRACT_CREATOR || 'SPACE'
    };
  }

  mapToContractDetailsData(contract: Contract): any {
    return {
      contractInfo: {
        durationYears: contract.DURATION_YEARS,
        durationMonths: contract.DURATION_MONTHS || 0,
        durationDays: contract.DURATION_DAYS || 0,
        startDate: contract.START_DATE,
        endDate: contract.END_DATE,
        rentRatio: contract.RENT_RATIO || 0,
        serviceRatio: contract.SERVICE_RATIO || 0,
        rentStartDate: contract.RENT_START_DATE,
        renewalNoticeDays: contract.RENEWAL_NOTICE_DAYS || 0,
        creditTermRent: contract.CREDIT_TERM_RENT,
        creditTermUtility: contract.CREDIT_TERM_UTILITY,
        paymentDay: contract.PAYMENT_DAY || 0,
        closurePenalty: contract.CLOSURE_PENALTY || 0,
        paymentMethod: contract.PAYMENT_METHOD,
        revenueCollection: contract.REVENUE_COLLECTION || 'none',
        hasAddendum: contract.HAS_ADDENDUM || false,
        adjustmentYears: contract.ADJUSTMENT_YEARS || 0,
        adjustmentPercent: contract.ADJUSTMENT_PERCENT || 0,
        excludedProducts: contract.EXCLUDED_PRODUCTS || '',
        renewalAgreements: contract.RENEWAL_AGREEMENTS || [],
        areaDetails: contract.AREA_DETAILS || [],
        requestAreaMeasurement: contract.REQUEST_AREA_MEASUREMENT || false
      },
      revenue: {
        revenueCodes: contract.REVENUE_CODES || [],
        otherRevenues: contract.OTHER_REVENUES || [],
        rentServiceType: contract.RENT_SERVICE_TYPE || '',
        unitNumber: contract.UNIT_NUMBER || '',
        advanceMonths: contract.ADVANCE_MONTHS || 0,
        amount: contract.AMOUNT || 0,
        paymentDueDate: contract.PAYMENT_DUE_DATE || '',
        taxCalculationMethod: contract.TAX_CALCULATION_METHOD || '',
        taxCollectionPeriod: contract.TAX_COLLECTION_PERIOD || ''
      },
      insurance: {
        vatRate: contract.VAT_RATE || 7,
        depositPeriod: contract.DEPOSIT_PERIOD,
        rentDepositRate: contract.RENT_DEPOSIT_RATE || 0,
        serviceDepositRate: contract.SERVICE_DEPOSIT_RATE || 0,
        commonDepositRate: contract.COMMON_DEPOSIT_RATE || 0,
        totalDepositRate: contract.TOTAL_DEPOSIT_RATE || 0,
        guarantees: contract.GUARANTEES || [],
        receiptTransfers: contract.RECEIPT_TRANSFERS || [],
        installments: contract.INSTALLMENTS || [],
        meterDueDate: contract.METER_DUE_DATE || '',
        meterAmount: contract.METER_AMOUNT || 0,
        meterCashPayment: contract.METER_CASH_PAYMENT || 0,
        meterTransfers: contract.METER_TRANSFERS || [],
        meterChecks: contract.METER_CHECKS || [],
        decorationDepositDueDate: contract.DECORATION_DEPOSIT_DUE_DATE || '',
        decorationDepositAmount: contract.DECORATION_DEPOSIT_AMOUNT || 0,
        decorationDepositCash: contract.DECORATION_DEPOSIT_CASH || 0,
        decorationDepositTransfers: contract.DECORATION_DEPOSIT_TRANSFERS || [],
        decorationDepositChecks: contract.DECORATION_DEPOSIT_CHECKS || []
      },
      decoration: {
        noDecoration: contract.NO_DECORATION || false,
        decorationStartDate: contract.DECORATION_START_DATE || '',
        decorationEndDate: contract.DECORATION_END_DATE || '',
        decorationDays: contract.DECORATION_DAYS || 0,
        pricePerSqmPerDay: contract.PRICE_PER_SQM_PER_DAY || 0,
        decorationTotalPrice: contract.DECORATION_TOTAL_PRICE || 0,
        openTime: contract.OPEN_TIME || '',
        closeTime: contract.CLOSE_TIME || '',
        salesAmountVat: contract.SALES_AMOUNT_VAT || 'include',
        phoneNumberCount: contract.PHONE_NUMBER_COUNT || 0,
        atmCount: contract.ATM_COUNT || 0,
        vendingCount: contract.VENDING_COUNT || 0,
        signalInstallationPoints: contract.SIGNAL_INSTALLATION_POINTS || 0,
        serviceContractType: contract.SERVICE_CONTRACT_TYPE || '',
        areaList: contract.AREA_DETAILS || []
      }
    };
  }

  mapToConditionsData(contract: Contract): any {
    return {
      subject: contract.SUBJECT || '',
      conditions: contract.CONTRACT_CONDITIONS || [],
      internalNotes: contract.INTERNAL_NOTES || ''
    };
  }

  mapToDocumentsData(contract: Contract): any {
    return {
      files: contract.FILES || []
    };
  }
}
