export const RewardTag = {
    CLOTHING: 'clothing',
    ACCESSORY: 'accessory',
    COSMETIC: 'cosmetic',
    AACC: 'aacc',
    OTHER: 'other',
} as const

export type RewardTag = (typeof RewardTag)[keyof typeof RewardTag]

export const TaxReceiptStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const

export type TaxReceiptStatus = (typeof TaxReceiptStatus)[keyof typeof TaxReceiptStatus]

export const RedemptionStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const

export type RedemptionStatus = (typeof RedemptionStatus)[keyof typeof RedemptionStatus]

export type RedemptionResolutionStatus =
    | typeof RedemptionStatus.COMPLETED
    | typeof RedemptionStatus.CANCELLED

export const UserRole = {
    USER: 'user',
    ADMIN: 'admin',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const REWARD_TAG_LABELS: Record<RewardTag, string> = {
    [RewardTag.CLOTHING]: 'Vestuário',
    [RewardTag.ACCESSORY]: 'Acessório',
    [RewardTag.COSMETIC]: 'Cosmético',
    [RewardTag.AACC]: 'Horas AACC',
    [RewardTag.OTHER]: 'Outros',
}

export const TAX_RECEIPT_STATUS_LABELS: Record<TaxReceiptStatus, string> = {
    [TaxReceiptStatus.APPROVED]: 'Aprovado',
    [TaxReceiptStatus.PENDING]: 'Em análise',
    [TaxReceiptStatus.REJECTED]: 'Rejeitado',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.USER]: 'Aluno',
    [UserRole.ADMIN]: 'Admin',
}
