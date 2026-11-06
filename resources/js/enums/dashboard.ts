export enum RewardTag {
    CLOTHING = 'clothing',
    ACCESSORY = 'accessory',
    COSMETIC = 'cosmetic',
    OTHER = 'other',
}

export enum TaxReceiptStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export const REWARD_TAG_LABELS: Record<RewardTag, string> = {
    [RewardTag.CLOTHING]: 'Vestuário',
    [RewardTag.ACCESSORY]: 'Acessório',
    [RewardTag.COSMETIC]: 'Cosmético',
    [RewardTag.OTHER]: 'Outros',
};

export const TAX_RECEIPT_STATUS_LABELS: Record<TaxReceiptStatus, string> = {
    [TaxReceiptStatus.APPROVED]: 'Aprovada',
    [TaxReceiptStatus.PENDING]: 'Em processamento',
    [TaxReceiptStatus.REJECTED]: 'Rejeitada',
};
