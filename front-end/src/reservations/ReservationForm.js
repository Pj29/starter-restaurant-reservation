import React from "react";
import { useHistory } from "react-router-dom";

function ReservationForm({ reservation, handleSubmit, handleChange }) {
  const history = useHistory();

  return (
    <form onSubmit={handleSubmit}>
      <section>
        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          name="first_name"
          id="first_name"
          onChange={handleChange}
          value={`${reservation.first_name}`}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          name="last_name"
          id="last_name"
          onChange={handleChange}
          value={`${reservation.last_name}`}
          required
        />
      </section>

      <section>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input
          type="tel"
          name="mobile_number"
          id="mobile_number"
          onChange={handleChange}
          value={`${reservation.mobile_number}`}
          pattern="^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$"
          required
        />
      </section>

      <section>
        <label htmlFor="date">Date</label>
        <input 
          type="date"
          name="reservation_date" 
          id="reservation_date"
          onChange={handleChange}
          value={`${reservation.reservation_date}`}
          placeholder="YYYY-MM-DD" 
          pattern="\d{4}-\d{2}-\d{2}"
          required
        />
      </section>

      <section>
        <label htmlFor="time">Time</label>
        <input 
          type="time" 
          name="reservation_time"
          id="reservation_time"
          onChange={handleChange}
          value={`${reservation.reservation_time}`}
          placeholder="HH:MM" 
          pattern="[0-9]{2}:[0-9]{2}"
          required
        />
      </section>

      <section>
        <label htmlFor="people">Number of Guests</label>
        <input
          type="number"
          name="people"
          id="people"
          onChange={handleChange}
          value={`${reservation.people}`}
          min="1"
          max="8"
          required
        />
      </section>

      <section>
        <button 
          type="submit"
          style={{ marginRight: "10px" }}>
            Submit
        </button>
        <button
          type="button"
          onClick={() => history.go(-1)}>
            Cancel
        </button>
      </section>
    </form>
  );
}

export default ReservationForm;