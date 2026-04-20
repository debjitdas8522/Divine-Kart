const _taxRate = process.env.TAX_RATE != null ? parseFloat(process.env.TAX_RATE) : NaN;
const _shipping = process.env.SHIPPING_FEE != null ? parseFloat(process.env.SHIPPING_FEE) : NaN;

export const PRICING_CONFIG = {
    TAX_RATE: Number.isNaN(_taxRate) ? 0.07 : _taxRate,
    DEFAULT_SHIPPING: Number.isNaN(_shipping) ? 0 : _shipping,
};
