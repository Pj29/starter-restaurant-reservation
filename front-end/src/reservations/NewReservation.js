import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { previous } from "../utils/date-time";

function NewReservation() {
    const history = useHistory();
    const [error, setError] = useState(null);

    const initialReservationForm = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: "",
    };

    const [reservation, setReservation] = useState(initialReservationForm);

    const changeHandler = useCallback(( { target }) => {
        setReservation(previousReservation => ({ ...previousReservation, [target.name]: target.value}));
    })
}