// import { StateAction } from "./enums/enum";
// import { AbstractControl, FormArray, FormGroup } from "@angular/forms";
// import { DOMGroupProperty } from "@interfaces/base/component_property.interface";
// import { firstValueFrom, Observable } from "rxjs";
// import { DataTableProperty, FilterDropdownItem, TableSortProperty } from "@interfaces/base/global_variables.interface";
// import { ControlPageService } from "@services/control-page.service";
// import { UtilService } from "@services/util.service";
// import { FilterMatchMode, SortEvent } from "primeng/api";
// import { Table } from "primeng/table";
// import { HttpResponse } from "@angular/common/http";
// import { DateTime } from 'luxon';
// import { FilterType } from "@components/templates/table/tp-table-filter.component";
// import { FilterEvent } from "@components/templates/table/tp-table.component";


// //#region ---- API functions ----

// export function JsonToUrlEncoded(json: any) {
//     const jsonString = JSON.stringify(json);
//     return encodeURIComponent(jsonString);
// }

// export function JsonToXWWWFormEncoded(json: any): string {
//     const queryString = Object.keys(json)
//         .map(key => {
//             const value = json[key];
//             if (Array.isArray(value)) {
//                 // If the array is empty, include it as `key=[]`
//                 return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
//             } else if (typeof value === 'object' && value !== null) {
//                 // Serialize nested objects as JSON strings
//                 return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
//             } else {
//                 // Serialize primitive values
//                 return `${key}=${encodeURIComponent(value != null ? value.toString() : '')}`;
//             }
//         })
//         .join('&');
//     return queryString;
// }

// export function toQueryString(record: Record<string, any>, allowNull: boolean = false): string {
//     if (!record) return "";
//     return Object.entries(record)
//         .filter(([_, value]) => allowNull || (value !== null && value !== undefined))
//         .flatMap(([key, value]) => {
//             if (Array.isArray(value)) {
//                 return value.map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
//             }
//             return [`${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`];
//         })
//         .join('&');
// }


// // export function toQueryString(record: Record<string, any>, allowNull: boolean = false): string {
// //     return Object.keys(record)
// //         .filter(key => allowNull || (record[key] !== null && record[key] !== undefined)) // Remove empty values if allowNull is false
// //         .map(key => `${encodeURIComponent(key)}=${allowNull ? encodeURIComponent(record[key] ?? '') : encodeURIComponent(record[key])}`)
// //         .join('&');
// // }


// export function ConvertDateByTick(raw?: string) {
//     if (!raw) return ""
//     const timestamp = parseInt(raw.replace(/\/Date\((\d+)\)\//, '$1'), 10);
//     // Create a Date object
//     return DateTime.fromMillis(timestamp).toFormat('dd/MM/yyyy');
// }

// export function ConvertDateStr(dateStr?: string, format?: string): Date | null {
//     if (!dateStr) return null
//     if (!format)
//         return DateTime.fromISO(dateStr).toJSDate();
//     else
//         return DateTime.fromFormat(dateStr, format).toJSDate();
// }

// export function GetModalActionText(action: StateAction): string {
//     switch (action) {
//         case StateAction.Add:
//             return "[เพิ่ม]";
//         case StateAction.Update:
//             return "[แก้ไข]";
//         case StateAction.View:
//             return "[ดู]";
//         default:
//             return "";
//     }
// }

// export function waitForAll<T>(requests: Promise<T> | Promise<T>[]): Promise<T[]> {
//     if (Array.isArray(requests)) {
//         return Promise.all(requests);
//     } else {
//         return Promise.all([requests]);
//     }
// }

// export async function firstResponse(request: Observable<any>) {
//     return firstValueFrom(request)
// }

// //#region --------- Search Page Function ------------

// export async function SearchPageFetching(
//     table: DataTableProperty,
//     params?: any | any[] | null,
//     selectedData?: any,
//     thenCallback?: (response: any) => void,
//     errorCallback?: (error: any) => void
// ) {
//     if (!table || table.fetching) return; // Prevent multiple fetch calls

//     const args: any[] = params == null
//         ? []
//         : Array.isArray(params)
//             ? params
//             : [params];

//     await table.fetch(...args)
//         .then(async (response: any) => {
//             table.fetching = false;
//             // console.log(response)
//             if (thenCallback) {
//                 thenCallback(response);
//             } else {
//                 table.onFetchSuccess(response);
//                 // table.onApplyChunk(response);
//             }

//             if (table.selectionMode === 'multiple') {
//                 table.selected = selectedData ? [matchItem(table.data, selectedData)] : []
//             } else {
//                 table.selected = selectedData ? matchItem(table.data, selectedData) : null
//             }
//         })
//         .catch(async (error: any) => {
//             table.fetching = false;
//             if (errorCallback) {
//                 errorCallback(error);
//             } else {
//                 table.onFetchError(error);
//             }
//             table.selected = null
//         });
// }


// export async function SearchPageDeleting(
//     cps: ControlPageService,
//     utilService: UtilService,
//     table: DataTableProperty,
//     params?: any[] | null,
//     thenCallback?: (response: any) => void,
//     errorCallback?: (error: any) => void
// ): Promise<void> {

//     const args: any = params ? params : undefined;

//     cps.setSubmitting(true);
//     await table.delete(args)
//         .then((response: any) => {
//             cps.setSubmitting(false);
//             if (thenCallback) {
//                 thenCallback(response);
//             } else {
//                 let resultMessage = "Delete completed";
//                 if (response && response.message) {
//                     resultMessage = response.message;
//                 }
//                 utilService.showNotifySuccessDelete(resultMessage)
//             }
//         })
//         .catch((error: any) => {
//             cps.setSubmitting(false);
//             if (errorCallback) {
//                 errorCallback(error);
//             } else {
//                 console.error('Error deleting data:', error);
//                 throw error
//             }
//         });
// }

// //#endregion


// //#region --------- Edit Page Function ------------

// export async function EditPageLoading(
//     cps: ControlPageService,
//     utilService: UtilService,
//     api: Promise<any> | Promise<any>[],
//     thenCallback: (response: any) => void,
//     errorCallback?: (error: any) => void
// ): Promise<void> {

//     if (cps.fetching) return; // Prevent multiple fetch calls
//     cps.setDisabledSave(true);
//     cps.setFetching(true)

//     const handler = Array.isArray(api) ? Promise.all(api) : api;

//     await handler
//         .then((response: any) => {
//             cps.setFetching(false)
//             cps.setDisabledSave(false);
//             thenCallback(response);

//         }).catch((error: any) => {
//             cps.setFetching(false)
//             if (errorCallback) {
//                 errorCallback(error);
//             } else {
//                 console.error(error)
//                 utilService.showNotifyError(error.message);
//             }
//         });

// }

// export async function EditPageSaving(
//     cps: ControlPageService,
//     utilService: UtilService,
//     api: Promise<any>,
//     thenCallback: (response: any) => any,
//     errorCallback?: (error: any) => void
// ): Promise<void> {

//     if (cps.submitting) return; // Prevent multiple submit calls
//     cps.setSubmitting(true);

//     await api.then((response: any) => {
//         cps.setSubmitting(false);
//         utilService.showNotifySuccessSave();
//         const selectedKey: any = thenCallback(response);
//         cps.goSearchPage(selectedKey)

//     }).catch((error: any) => {
//         cps.setSubmitting(false);
//         if (errorCallback) {
//             errorCallback(error);
//         } else {
//             console.error(error)
//             throw error;
//         }
//     });

// }

// //#endregion


// //#region ---- DDL functions ----

// export function addArrayKeys(_array: any[], _key: string, _display_format: string, keyObj?: { key: string, label: string }): any[] {
//     // Remove Empty Value
//     _array = _array.filter((item: any) => item[_key] !== null && item[_key] !== '');
//     // Add option_key & option_label
//     _array.forEach((item: any) => {
//         if (!keyObj) {
//             item.option_key = item[_key];
//             item.option_label = formatDisplayText(item, _display_format)
//         } else {
//             item[keyObj.key] = item[_key];
//             item[keyObj.label] = formatDisplayText(item, _display_format)
//         }
//     });
//     return _array;
// }

// export function formatDisplayText(option: any, format: string): string {
//     // Replace each placeholder with the corresponding property value from `option`
//     return format.replace(/\{(\w+)\}/g, (_, property) => option[property] || '');
// }


// export function setOnChangeDDL(_form: FormGroup, getDDLOptions: () => any[], _ddlfield: string, _ddlKey: string, _callable: (selectedOption: any) => void) {
//     _form.get(_ddlfield)?.valueChanges.subscribe((selectedValue) => {
//         const _ddlOptions = getDDLOptions();
//         const selectedOption = _ddlOptions.find(option => option[_ddlKey] === selectedValue);
//         _callable(selectedOption);
//     });
// }

// export function setFormOnChange(formData: FormGroup, fieldName: string | string[], onChange: (changedValue: any) => void) {
//     if (typeof (fieldName) === 'string') {
//         formData.get(fieldName)?.valueChanges.subscribe((value) => {
//             onChange(value);
//         });
//     } else if (Array.isArray(fieldName)) {
//         fieldName.forEach(name => {
//             formData.get(name)?.valueChanges.subscribe((value) => {
//                 onChange(value);
//             });
//         })
//     }
// }

// export function getYearDropdown(fromYear?: number, toYear?: number): Number[] {
//     const currentYear = DateTime.now().year;
//     if (fromYear === undefined) {
//         return [currentYear];
//     } else if (toYear === undefined) {
//         return [fromYear];
//     } else {
//         const start = Math.min(fromYear, toYear);
//         const end = Math.max(fromYear, toYear);
//         return Array.from({ length: end - start + 1 }, (_, i) => start + i);
//     }
// }

// export function getMonthDropdown(): { value: number, label: string, name: string }[] {
//     return Array.from({ length: 12 }, (_, i) => {
//         const month = i + 1;
//         const name = DateTime.fromObject({ month }).toFormat('LLL'); // Full month name
//         const displayName = DateTime.fromObject({ month }).toFormat('LLLL'); // Full month name
//         return {
//             value: month,
//             label: `month.full.${name.toLocaleLowerCase()}`,
//             name: displayName
//         };
//     });
// }
// //#region ---- Form functions ----

// function getControlName(control: AbstractControl): string | null {
//     if (!control.parent) return null; // No parent, no name

//     const parent = control.parent;

//     if (parent instanceof FormGroup) {
//         // For FormGroup, find the name by iterating over the parent's controls
//         return Object.keys(parent.controls).find((name) => control === parent.controls[name]) || null;
//     }

//     if (parent instanceof FormArray) {
//         // For FormArray, find the index of the control
//         const index = parent.controls.findIndex((ctrl) => ctrl === control);
//         return index !== -1 ? `${index}` : null;
//     }

//     return null;
// }


// export function getControlByName(formData: FormGroup, formGroupName: string, controlName: string) {
//     if (formGroupName) {
//         return formData.get(formGroupName)?.get(controlName);
//     } else {
//         return formData.get(controlName);
//     }
// }

// export function domGroupSearch(domGroupProperties: DOMGroupProperty[], forVar: string): string | null {
//     for (const group of domGroupProperties) {
//         if (group.items && Array.isArray(group.items)) {
//             for (const item of group.items) {
//                 if (
//                     item.domType === 'label' &&
//                     item.propLabel &&
//                     item.propLabel.for === forVar
//                 ) {
//                     return item.propLabel.text; // Return the 'text' if found
//                 }
//             }
//         }
//     }
//     return null; // Return null if not found
// }


// // export function getDomCheckboxValues(domGroupProperties: any[], varName: string): string[] {
// //     const values: string[] = [];

// //     domGroupProperties.forEach(group => {
// //         group.items
// //             .filter((item: any) => item.domType === 'checkbox' && item.propCheckbox && item.propCheckbox.var === varName && item.propCheckbox.items)
// //             .forEach((checkbox: any) => {
// //                 checkbox.propCheckbox.items.forEach((item: any) => {
// //                     if (item.value) {
// //                         values.push(item.value);
// //                     }
// //                 });
// //             });
// //     });

// //     return values;
// // }

// export function onValueChange_numberic(value: string) {
//     return value.replace(/[^0-9]/g, '');
// }

// export function onValueChange_limitLength(value: string, digit: number) {
//     return value.substring(0, digit);
// }

// export function maxLength(value: string, maxLength: number) {
//     return value.slice(0, maxLength);
// }

// export function upper(value: string) {
//     return value.toUpperCase();
// }

// export function upperAndMaxLength(value: string, maxLength: number) {
//     return value.toUpperCase().slice(0, maxLength);
// }

// //#region ----------- Util functions ---------------

// export function matchItem<T>(data: T[], condition: { [key: string]: any }): T | undefined {
//     return data.find((item: any) =>
//         Object.entries(condition).every(([key, value]) => item[key] === value)
//     );
// }

// export function handleResponseFileDownload(response: HttpResponse<Blob>) {
//     const blob = response.body;
//     if (!blob) return;

//     const disposition = response.headers.get('Content-Disposition') || '';
//     const url = window.URL.createObjectURL(blob);

//     if (disposition.toLowerCase().includes('inline')) {
//         // opens in browser tab
//         window.open(url, '_blank');
//         URL.revokeObjectURL(url); // clean up
//     } else if (disposition.toLowerCase().includes('attachment')) {
//         // force Download
//         const link = document.createElement('a');
//         const filename = getFileNameFromDisposition(disposition) || 'file';

//         link.href = url;
//         link.download = filename; // or use from response header
//         link.click();
//         URL.revokeObjectURL(url); // clean up
//     }
// }

// export function getFileNameFromDisposition(header: string | null): string | null {
//     if (!header) return null;

//     const match = header.match(/filename[^;=\n]*=(['"]?)([^;\n]*)\1/);
//     return match?.[2] || null;
// }

// export function formatDuration(durationMs: number): string {
//     if (durationMs < 1000) {
//         return `${Math.round(durationMs)}ms`;
//     } else {
//         return `${(durationMs / 1000).toFixed(1)}s`;
//     }
// }

// export function getTimeAgo(dateInput: string | number | Date): string {
//     const date = new Date(dateInput);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (diffInSeconds < 5) return 'just now';
//     if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;

//     const diffInMinutes = Math.floor(diffInSeconds / 60);
//     if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

//     const diffInHours = Math.floor(diffInMinutes / 60);
//     if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;

//     const diffInDays = Math.floor(diffInHours / 24);
//     if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

//     const diffInWeeks = Math.floor(diffInDays / 7);
//     if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;

//     const diffInMonths = Math.floor(diffInDays / 30);
//     if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;

//     const diffInYears = Math.floor(diffInDays / 365);
//     return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
// }

// export function getTimeDiffInTextFormat(fromDate: Date, toDate: Date, absoluteDiff: boolean = false): string {
//     const fromMs = fromDate.getTime();
//     const toMs = toDate.getTime();
//     const diffMs = absoluteDiff ? Math.abs(toMs - fromMs) : toMs - fromMs;

//     const isNegative = !absoluteDiff && diffMs < 0;
//     const totalMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));

//     const weeks = Math.floor(totalMinutes / (60 * 24 * 7));
//     const days = Math.floor((totalMinutes % (60 * 24 * 7)) / (60 * 24));
//     const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
//     const minutes = totalMinutes % 60;

//     const parts: string[] = [];
//     if (weeks) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
//     if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
//     if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
//     if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

//     const result = parts.join(' ');
//     return isNegative ? `- ${result}` : result;
// }

// export function getTimeTextFormat(minute: number): string {
//     const weeks = Math.floor(minute / (60 * 24 * 7));
//     const days = Math.floor((minute % (60 * 24 * 7)) / (60 * 24));
//     const hours = Math.floor((minute % (60 * 24)) / 60);
//     const minutes = minute % 60;

//     const parts: string[] = [];
//     if (weeks) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
//     if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
//     if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
//     if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

//     return parts.join(' ');
// }

// export function isSameDay(date1: Date, date2: Date): boolean {
//     return DateTime.fromJSDate(date1).hasSame(DateTime.fromJSDate(date2), 'day');
// }

// export function isSameDayStr(date1: string, date2: string): boolean {
//     return DateTime.fromISO(date1).hasSame(DateTime.fromISO(date2), 'day');
// }

// export function applyBlobToImage(blob: Blob): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result as string);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//     });
// }


// export function formatCurrency(value: number, minimumFraction = 2, maximumFraction = 2) {
//     return value.toLocaleString('en-US', {
//         minimumFractionDigits: minimumFraction,
//         maximumFractionDigits: maximumFraction
//     });
// }

// export function getFloat(input?: any): number | undefined {
//     if (input === undefined || input === null || input === '') {
//         return undefined;
//     }

//     if (typeof input === 'number') {
//         return Number.isFinite(input) ? input : NaN;
//     }

//     if (typeof input === 'string') {
//         const n = parseFloat(input);
//         return Number.isNaN(n) ? undefined : n;
//     }

//     return undefined;
// }

// export function randomStringSecure(len = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
//     if (len <= 0) return '';
//     const result = [];
//     const charsLen = charset.length;

//     // Rejection-sampling to avoid modulo bias
//     const maxMultiple = Math.floor(256 / charsLen) * charsLen;

//     while (result.length < len) {
//         const buf = new Uint8Array(len); // batch pull
//         crypto.getRandomValues(buf);
//         for (let i = 0; i < buf.length && result.length < len; i++) {
//             const x = buf[i];
//             if (x < maxMultiple) {
//                 result.push(charset[x % charsLen]);
//             }
//         }
//     }
//     return result.join('');
// }

// export function randomString(len = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
//     let s = '';
//     for (let i = 0; i < len; i++) {
//         s += charset[Math.floor(Math.random() * charset.length)];
//     }
//     return s;
// }

// // Integer in [min, max] (inclusive)
// export function randomInt(min: number, max: number) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }
// //#endregion



// //#region ----------- Table functions ---------------

// export function customSorting(event: SortEvent, dataTable: DataTableProperty) {
//     if (dataTable && dataTable.table) {
//         const filters = JSON.parse(JSON.stringify(dataTable.table.filters)) || {};
//         const resetToDefault = columnSortTable(event, dataTable.sortProperty, dataTable.table)
//         if (resetToDefault) {
//             dataTable.data = [...dataTable.initialValue];
//             dataTable.table.filters = filters; // Reapply filters
//         }
//     }
// }

// export function columnSortTable(event: SortEvent, sortProperty: TableSortProperty, dt: Table): boolean {
//     if (event.field === sortProperty.sortField && event.order === sortProperty.sortOrder) {
//         sortTableData(event);
//         return false;
//     }

//     if (sortProperty.sortOrder == null || sortProperty.sortOrder === undefined) {
//         sortProperty.sortOrder = 1;
//         sortProperty.sortField = event.field;
//         sortTableData(event);
//     } else if (sortProperty.sortOrder == 1 || sortProperty.sortField !== event.field) {
//         sortProperty.sortOrder = (event.field !== sortProperty.sortField ? 1 : -1);
//         sortProperty.sortField = event.field;
//         sortTableData(event);
//     } else if (sortProperty.sortOrder == -1) {
//         sortProperty.sortOrder = 1;
//         sortProperty.sortField = undefined;
//         dt.sortField = undefined;
//         dt.sortOrder = 1;
//         //dt.reset();
//         return true
//     }

//     return false
// }

// export function sortTableData(event: any) {
//     event.data.sort((data1: any, data2: any) => {
//         let value1 = data1[event.field];
//         let value2 = data2[event.field];
//         let result = null;
//         if (value1 == null && value2 != null) result = -1;
//         else if (value1 != null && value2 == null) result = 1;
//         else if (value1 == null && value2 == null) result = 0;
//         else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
//         else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

//         return event.order * result;
//     });
// }


// export function applyColumnFilter(dt: Table, columnName: string, event: FilterEvent) {
//     if (!dt) return;

//     const rawValue = event?.search;
//     const matchMode = (event?.filter as string) || (event?.type === 'select' ? 'in' : 'contains');

//     let value: any = null;
//     if (Array.isArray(rawValue)) {
//         value = rawValue.length ? rawValue : null;       // MultiSelect -> 'in' ต้องการ array แต่ถ้าว่างให้เป็น null
//     } else if (rawValue !== undefined && rawValue !== null && String(rawValue).trim() !== '') {
//         value = rawValue;                                 // Text ที่ไม่ว่าง
//     }
//     dt.filter(value, columnName, matchMode);

//     // if (event.type === 'select') {
//     //     if (event.search && event.search.length > 0) {
//     //         dt.filters[columnName] = { value: event.search, matchMode: event.filter as string };
//     //     } else {
//     //         if (dt.selectionMode === 'multiple') {
//     //             dt.filters[columnName] = []
//     //         } else {
//     //             dt.filters[columnName] = {}
//     //         }
//     //     }
//     //     dt._filter();
//     // } else {
//     //     dt.filter(event.search, columnName, event.filter as string)
//     // }
// }

// export function applySort(dt: Table, sortField: string | string[] | null | undefined, sortOrder: 1 | -1 | 0): void {
//     if (!dt) return;

//     if (Array.isArray(sortField)) {
//         // If sortField is an array, PrimeNG v19 supports multi-sort using dt.multiSortMeta
//         // dt. sortMode = 'multiple';
//     } else {
//         // Single sort field
//         dt.sort(sortField)
//         dt.sortSingle()
//         // dt.sortField = sortField ?? null;
//         // dt.sortOrder = sortOrder;
//         // dt.sortMode = 'single';
//     }
// }

// export function generateTableRowKey(): string {
//     return Math.random().toString(36).substring(2, 10);
// }
// //#endregion
