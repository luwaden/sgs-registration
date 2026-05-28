import {Country,State,City } from "https://cdn.jsdelivr.net/npm/country-state-city/+esm";

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYl0lExvq-srXlJREyzvyxLqQhZEGUVp7WkUb-ieImaWLw7aKQPsJwgStRYqbaO2Ar/exec';


const THANK_YOU_PAGE  = './thankyou.html';

/* ── intl-tel-input ──────────────────────────────────────────── */
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
    // utils script loaded via <script> tag in HTML
});

/* ── Country-State-City helpers ──────────────────────────────── */
// CSC exposes `csc` or `CountryStateCityAPI` depending on the build
// const CSC = window.csc || window.CountryStateCityAPI;

// const countrySelect  = document.getElementById('country');
// const stateSelect    = document.getElementById('state');
// const citySelect     = document.getElementById('city');

// function populateCountries() {
//     const countries = CSC.getAllCountries();
//     countries.forEach(c => {
//         const opt = document.createElement('option');
//         opt.value        = c.isoCode;           // store ISO for lookups
//         opt.dataset.name = c.name;              // keep full name for submission
//         opt.textContent  = c.name;
//         countrySelect.appendChild(opt);
//     });
// }

// function populateStates(countryCode) {
//     stateSelect.innerHTML = '<option value="">Select your state/province</option>';
//     citySelect.innerHTML  = '<option value="">Select your city (optional)</option>';

//     const states = CSC.getStatesOfCountry(countryCode);
//     states.forEach(s => {
//         const opt = document.createElement('option');
//         opt.value        = s.isoCode;
//         opt.dataset.name = s.name;
//         opt.textContent  = s.name;
//         stateSelect.appendChild(opt);
//     });
// }

// function populateCities(countryCode, stateCode) {
//     citySelect.innerHTML = '<option value="">Select your city (optional)</option>';

//     const cities = CSC.getCitiesOfState(countryCode, stateCode);
//     cities.forEach(c => {
//         const opt = document.createElement('option');
//         opt.value       = c.name;
//         opt.textContent = c.name;
//         citySelect.appendChild(opt);
//     });
// }


const countrySelect = document.getElementById('country');
const stateSelect = document.getElementById('state');
const citySelect = document.getElementById('city');


// Populate countries
Country.getAllCountries().forEach(country => {

    const option = document.createElement('option');

    option.value = country.isoCode;
    option.textContent = country.name;

    countrySelect.appendChild(option);
});


// Populate states
countrySelect.addEventListener('change', () => {

    stateSelect.innerHTML =
        '<option value="">Select State</option>';

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    const states =
        State.getStatesOfCountry(countrySelect.value);

    states.forEach(state => {

        const option = document.createElement('option');

        option.value = state.isoCode;
        option.textContent = state.name;

        stateSelect.appendChild(option);
    });
});


// Populate cities
stateSelect.addEventListener('change', () => {

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    const cities = City.getCitiesOfState(
        countrySelect.value,
        stateSelect.value
    );

    cities.forEach(city => {

        const option = document.createElement('option');

        option.value = city.name;
        option.textContent = city.name;

        citySelect.appendChild(option);
    });
});

countrySelect.addEventListener('change', function () {
    const isoCode = this.value;
    if (isoCode) populateStates(isoCode);
    else {
        stateSelect.innerHTML = '<option value="">Select your state/province</option>';
        citySelect.innerHTML  = '<option value="">Select your city (optional)</option>';
    }
});

stateSelect.addEventListener('change', function () {
    const stateCode   = this.value;
    const countryCode = countrySelect.value;
    if (stateCode && countryCode) populateCities(countryCode, stateCode);
    else citySelect.innerHTML = '<option value="">Select your city (optional)</option>';
});

/* ── Validation helpers ──────────────────────────────────────── */
function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errorId).classList.add('show');
}

function hideError(fieldId, errorId) {
    document.getElementById(fieldId).classList.remove('error');
    document.getElementById(errorId).classList.remove('show');
}

function validateForm() {
    let isValid = true;

    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim() || firstName.value.trim().length < 2) {
        showError('firstName', 'firstNameError'); isValid = false;
    } else { hideError('firstName', 'firstNameError'); }

    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim() || lastName.value.trim().length < 2) {
        showError('lastName', 'lastNameError'); isValid = false;
    } else { hideError('lastName', 'lastNameError'); }

    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value)) {
        showError('email', 'emailError'); isValid = false;
    } else { hideError('email', 'emailError'); }

    // Phone: valid if iti reports valid number OR at least 7 digits entered
    const rawPhone = phoneInput.value.trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (!rawPhone || (!iti.isValidNumber() && digitsOnly.length < 7)) {
        showError('whatsapp', 'whatsappError'); isValid = false;
    } else { hideError('whatsapp', 'whatsappError'); }

    const country = document.getElementById('country');
    if (!country.value) {
        showError('country', 'countryError'); isValid = false;
    } else { hideError('country', 'countryError'); }

    const state = document.getElementById('state');
    if (!state.value) {
        showError('state', 'stateError'); isValid = false;
    } else { hideError('state', 'stateError'); }

    // city is optional — no validation needed

    const paymentPlan = document.getElementById('paymentPlan');
    if (!paymentPlan.value) {
        showError('paymentPlan', 'paymentPlanError'); isValid = false;
    } else { hideError('paymentPlan', 'paymentPlanError'); }

    return isValid;
}

/* ── UTM helper ──────────────────────────────────────────────── */
function getUTMSource() {
    const p = new URLSearchParams(window.location.search);
    return {
        utm_source:   p.get('utm_source')   || 'Direct',
        utm_medium:   p.get('utm_medium')   || '',
        utm_campaign: p.get('utm_campaign') || '',
        utm_content:  p.get('utm_content')  || '',
        utm_term:     p.get('utm_term')     || ''
    };
}

/* ── Form submit ─────────────────────────────────────────────── */
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const utm       = getUTMSource();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();

    // Resolve human-readable country / state names from selected ISO codes
    const countryEl  = document.getElementById('country');
    const stateEl    = document.getElementById('state');
    const selectedCountryOpt = countryEl.options[countryEl.selectedIndex];
    const selectedStateOpt   = stateEl.options[stateEl.selectedIndex];

    const countryName = selectedCountryOpt ? (selectedCountryOpt.dataset.name || selectedCountryOpt.value) : countryEl.value;
    const stateName   = selectedStateOpt   ? (selectedStateOpt.dataset.name   || selectedStateOpt.value)   : stateEl.value;

    const formData = {
        timestamp:    new Date().toISOString(),
        firstName,
        lastName,
        fullName:     firstName + ' ' + lastName,
        email:        document.getElementById('email').value.trim(),
        whatsapp:     iti.getNumber(),
        city:         document.getElementById('city').value || '',
        state:        stateName,
        country:      countryName,
        paymentPlan:  document.getElementById('paymentPlan').value,
        utm_source:   utm.utm_source,
        utm_medium:   utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_content:  utm.utm_content,
        utm_term:     utm.utm_term
    };

    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Grant Writing Course Registration',
            content_category: 'Course Registration',
            value: 55000,
            currency: 'NGN'
        });
    }

    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('loadingState').classList.add('show');

    try {
        const params = new URLSearchParams(formData);
        await fetch(APPS_SCRIPT_URL, {
            method:  'POST',
            mode:    'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    params.toString()
        });

        sessionStorage.setItem('registrationData', JSON.stringify({
            name:  formData.fullName,
            email: formData.email
        }));

        setTimeout(() => { window.location.href = THANK_YOU_PAGE; }, 1500);

    } catch (error) {
        console.error('Submission error:', error);
        document.getElementById('loadingState').classList.remove('show');
        document.getElementById('registrationForm').style.display = 'block';
        alert('There was an error submitting your registration. Please try again.');
    }
});

/* ── Inline blur validation ──────────────────────────────────── */
document.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('blur', function () { if (this.value) validateForm(); });
});

/* ── Init ────────────────────────────────────────────────────── */
window.addEventListener('load', function () {
    populateCountries();

    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', { content_name: 'Registration Form', content_category: 'Form' });
    }
});