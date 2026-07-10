const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const verifyEmailTemplate = ({ name, url }) => {
    const safeName = escapeHtml(name);
    // Only allow http/https URLs to prevent javascript: injection
    const safeUrl = /^https?:\/\//i.test(url) ? url : '#';
    return`
<p>Dear ${safeName}</p>    
<p>Thank you for registering with DivineKart.</p>   
<a href="${safeUrl}" style="color:black;background:orange;margin-top:10px;padding:20px;display:block">
    Verify Email
</a>
`
}

export default verifyEmailTemplate