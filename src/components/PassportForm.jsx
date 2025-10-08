import { useState } from 'react';
import './PassportForm.css';

const PassportForm = ({ onSubmit, locked }) => {
  const [formData, setFormData] = useState({ name: '', dob: '' });
  const [touched, setTouched] = useState({ name: false, dob: false });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (locked) {
      return;
    }

    if (!formData.name.trim() || !formData.dob) {
      setTouched({ name: true, dob: true });
      return;
    }
    onSubmit(formData);
  };

  const minDate = '1920-01-01';
  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <form className="passport-form" onSubmit={handleSubmit}>
      <p className="form-lead">Initialize your coordinates for the 2050 gateway.</p>
      <label htmlFor="name">Chosen Name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange}
        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        aria-invalid={touched.name && !formData.name.trim()}
        required
      />
      {touched.name && !formData.name.trim() ? (
        <span className="field-error">We need a name to print your passport.</span>
      ) : null}

      <label htmlFor="dob">Datestamp of Origin</label>
      <input
        id="dob"
        name="dob"
        type="date"
        value={formData.dob}
        onChange={handleChange}
        onBlur={() => setTouched((prev) => ({ ...prev, dob: true }))}
        min={minDate}
        max={maxDate}
        aria-invalid={touched.dob && !formData.dob}
        required
      />
      {touched.dob && !formData.dob ? (
        <span className="field-error">Select a valid date to authenticate.</span>
      ) : null}

      <button type="submit" className="cta" disabled={locked}>
        {locked ? 'Passport Already Generated' : 'Generate Future Passport'}
      </button>
      {locked ? <p className="form-lock">This terminal already holds an active passport. Clear your cookies to request a new one.</p> : null}
    </form>
  );
};

export default PassportForm;