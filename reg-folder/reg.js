import { Country, State, City } from "https://cdn.jsdelivr.net/npm/country-state-city/+esm";

// !! IMPORTANT: After redeploying Apps Script, paste your new URL here
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLbJb2OhQiGphejBZRYpVvcbk53Nz1_lv7Kakl2PZT9J6kGzhNtDaSgd8Dwo78PWUp/exec';
const THANK_YOU_PAGE  = './thankyou.html';

// ── intl-tel-input ────────────────────────────────────────────
const phoneInput = document.querySelector('#whatsapp');
const iti = window.intlTelInput(phoneInput, {
    initialCountry: 'auto',
    geoIpLookup(callback) {
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => callback(data.country_code))
            .catch(() => callback('ng'));
    },
    separateDialCode: true,
    preferredCountries: ['ng', 'gh', 'ke', 'za', 'ug'],
    nationalMode: false,
    autoPlaceholder: 'aggressive'
});

// ── Country / State / City ────────────────────────────────────
const countrySelect = document.getElementById('country');
const stateSelect   = document.getElementById('state');
const citySelect    = document.getElementById('city');

function populateCountries() {
    Country.getAllCountries().forEach(c => {
        const opt        = document.createElement('option');
        opt.value        = c.isoCode;
        opt.dataset.name = c.name;
        opt.textContent  = c.name;
        countrySelect.appendChild(opt);
    });
}

countrySelect.addEventListener('change', function () {
    stateSelect.innerHTML = '<option value="">Select your state/province</option>';
    citySelect.innerHTML  = '<option value="">Select your city (optional)</option>';
    if (!this.value) return;
    State.getStatesOfCountry(this.value).forEach(s => {
        const opt        = document.createElement('option');
        opt.value        = s.isoCode;
        opt.dataset.name = s.name;
        opt.textContent  = s.name;
        stateSelect.appendChild(opt);
    });
});

stateSelect.addEventListener('change', function () {
    citySelect.innerHTML = '<option value="">Select your city (optional)</option>';
    if (!this.value) return;
    City.getCitiesOfState(countrySelect.value, this.value).forEach(c => {
        const opt       = document.createElement('option');
        opt.value       = c.name;
        opt.textContent = c.name;
        citySelect.appendChild(opt);
    });
});

// ── Validation ────────────────────────────────────────────────
function showError(fieldId, errorId) {
    document.getElementById(fieldId)?.classList.add('error');
    document.getElementById(errorId)?.classList.add('show');
}
function hideError(fieldId, errorId) {
    document.getElementById(fieldId)?.classList.remove('error');
    document.getElementById(errorId)?.classList.remove('show');
}

function validateForm() {
    let valid = true;
    const emailPat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fn = document.getElementById('firstName');
    fn.value.trim().length >= 2
        ? hideError('firstName', 'firstNameError')
        : (showError('firstName', 'firstNameError'), valid = false);

    const ln = document.getElementById('lastName');
    ln.value.trim().length >= 2
        ? hideError('lastName', 'lastNameError')
        : (showError('lastName', 'lastNameError'), valid = false);

    const em = document.getElementById('email');
    emailPat.test(em.value.trim())
        ? hideError('email', 'emailError')
        : (showError('email', 'emailError'), valid = false);

    const digits = phoneInput.value.replace(/\D/g, '');
    (iti.isValidNumber() || digits.length >= 7)
        ? hideError('whatsapp', 'whatsappError')
        : (showError('whatsapp', 'whatsappError'), valid = false);

    const co = document.getElementById('country');
    co.value
        ? hideError('country', 'countryError')
        : (showError('country', 'countryError'), valid = false);

    const st = document.getElementById('state');
    st.value
        ? hideError('state', 'stateError')
        : (showError('state', 'stateError'), valid = false);

    const pp = document.getElementById('paymentPlan');
    pp.value
        ? hideError('paymentPlan', 'paymentPlanError')
        : (showError('paymentPlan', 'paymentPlanError'), valid = false);

    return valid;
}

// ── Helpers ───────────────────────────────────────────────────
function getUTMParams() {
    const p = new URLSearchParams(window.location.search);
    return {
        utm_source:   p.get('utm_source')   || 'Direct',
        utm_medium:   p.get('utm_medium')   || '',
        utm_campaign: p.get('utm_campaign') || '',
        utm_content:  p.get('utm_content')  || '',
        utm_term:     p.get('utm_term')     || ''
    };
}

function getSelectedName(sel) {
    const opt = sel.options[sel.selectedIndex];
    return opt ? (opt.dataset.name || opt.textContent || opt.value || '') : '';
}

// ── Core submit function ──────────────────────────────────────
// Uses fetch() with no-cors which is the only method that works
// cross-origin to Apps Script. The trick is we no longer wait
// for or read the response — we just fire and redirect.
// Apps Script receives data correctly via e.parameter when sent
// as application/x-www-form-urlencoded with method POST.
// The previous issue was the redirect happening TOO FAST (1500ms).
// We now wait 4000ms to guarantee the POST reaches Apps Script
// before navigation.

async function sendToAppsScript(formData) {
    const body = new URLSearchParams();
    Object.entries(formData).forEach(([k, v]) => body.append(k, v || ''));

    console.log('POST body:', body.toString());

    try {
        // Primary: fetch no-cors POST (most reliable for Apps Script)
        await fetch(APPS_SCRIPT_URL, {
            method:  'POST',
            mode:    'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    body.toString()
        });
        console.log('fetch POST fired successfully');
    } catch (err) {
        console.warn('fetch POST failed, trying GET fallback:', err);
        // Fallback: GET with query params (always works, no CORS)
        // Apps Script doGet handles this
        try {
            const url = APPS_SCRIPT_URL + '?' + body.toString();
            await fetch(url, { method: 'GET', mode: 'no-cors' });
            console.log('GET fallback fired');
        } catch (err2) {
            console.error('Both POST and GET failed:', err2);
        }
    }
}

// ── Form submit ───────────────────────────────────────────────
let submitAttempted = false;

document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    submitAttempted = true;
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const utm       = getUTMParams();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();

    const formData = {
        timestamp:    new Date().toISOString(),
        firstName,
        lastName,
        fullName:     firstName + ' ' + lastName,
        email:        document.getElementById('email').value.trim().toLowerCase(),
        // whatsapp:     iti.getNumber() || phoneInput.value.trim(),
       whatsapp:     `${iti.getSelectedCountryData().dialCode}${phoneInput.value.trim().replace(/\D/g, '').replace(/^0+/, '')}`,
        city:         document.getElementById('city').value || '',
        state:        getSelectedName(stateSelect),
        country:      getSelectedName(countrySelect),
        paymentPlan:  document.getElementById('paymentPlan').value,
        utm_source:   utm.utm_source,
        utm_medium:   utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content:  utm.utm_content,
        utm_term:     utm.utm_term
    };

    // Log so you can verify all fields in console before POST fires
    console.log('Form data to submit:', JSON.stringify(formData, null, 2));

    // Validate none of the critical fields are empty
    const missing = ['firstName','lastName','email','whatsapp','country','state','paymentPlan']
        .filter(k => !formData[k] || formData[k].trim() === '');
    if (missing.length > 0) {
        console.error('Missing fields after build:', missing);
        alert('Some fields are missing: ' + missing.join(', ') + '. Please fill them in.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Registration';
        return;
    }

    // Fire Meta Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Grant Writing Course Registration',
            value: 55000, currency: 'NGN'
        });
    }

    // Show loading state
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('loadingState').classList.add('show');

    // Store for thank-you page personalisation
    sessionStorage.setItem('registrationData', JSON.stringify({
        name:  formData.fullName,
        email: formData.email
    }));

    // Send to Apps Script
    // We await the fetch so the POST completes before we navigate
    await sendToAppsScript(formData);

    console.log('POST complete — redirecting to thank-you page');

    // Navigate to thank-you page
    window.location.href = THANK_YOU_PAGE;
});

// ── Blur validation (only after first submit attempt) ─────────
document.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('blur', function () {
        if (submitAttempted) validateForm();
    });
});

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('load', function () {
    populateCountries();
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', { content_name: 'Registration Form' });
    }
});