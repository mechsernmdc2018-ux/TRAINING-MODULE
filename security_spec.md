# Security Specification: NMDC Donimalai Mine Vocational Training Portal

## 1. Data Invariants
- **Identity & Integrity**: Personnel documents must have IDs matching document path variables.
- **Worker Employment Classification**: Must be either `NMDC_REGULAR` or `CONTRACT_WORKER` with verified employment status.
- **Contractor Governance**: Works orders and approved manpower are strictly tracked with contractor status validation.
- **Statutory Traceability**: MVT training sessions and statutory requirements must have non-empty titles and valid lifecycle status.
- **Immutability of Audit Trails**: `auditLogs` is append-only; updates and deletions are strictly rejected to ensure non-repudiation under DGMS compliance standards.

## 2. Dirty Dozen Attack Payloads & Test Scenarios
1. **Unauthenticated Write**: An unauthenticated client attempts to create an employee record -> Rejected with `PERMISSION_DENIED`.
2. **Path Id Spoofing**: Attempt to insert an employee document where `incoming().id != employeeId` -> Rejected.
3. **Ghost Fields Injection**: Sending unexpected arbitrary administrative escalation fields -> Blocked by strict validation.
4. **Audit Trail Tampering**: Attempting an `update` or `delete` operation on `/auditLogs/{logId}` -> Blocked by default deny rule.
5. **Contractor Code Poisoning**: Providing a contractor without required fields (`code`, `workOrderNumber`) -> Blocked.
6. **Negative Session Capacity / Invalid Status**: Providing a session with status outside allowed enum -> Blocked.
7. **Certificate Counterfeit**: Providing a certificate without `workerId` or `issueDate` -> Blocked.
8. **Statutory Requirement Nullification**: Attempting to set an invalid empty statutory act code -> Blocked.
9. **Arbitrary Document Injection**: Attempting to write into an unregistered collection -> Blocked by root catch-all rule.
10. **Malicious ID Characters**: Attempting to use path IDs containing script tags or traversal characters -> Blocked by `isValidId`.
11. **Denial of Wallet Oversized Payload**: Attempting to send strings exceeding maximum allowed size limits -> Blocked.
12. **Status Bypass**: Bypassing allowed verification and employment state enums -> Blocked.
