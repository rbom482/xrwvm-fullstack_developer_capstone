import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState();
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("postreview"));
  let params = useParams();
  let id = params.id;
  let dealer_url = `${root_url}djangoapp/dealer/${id}`;
  let review_url = `${root_url}djangoapp/add_review`;
  let carmodels_url = `${root_url}djangoapp/get_cars`;

  // Memoize post review function
  const postreview = useCallback(async () => {
    let name = `${sessionStorage.getItem("firstname")} ${sessionStorage.getItem("lastname")}`;

    // Fallback to username if first and last name are not available
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || review === "" || date === "" || year === "" || !model) {
      alert("All details are mandatory");
      return;
    }

    let [make_chosen, model_chosen] = model.split(" ");

    let jsoninput = JSON.stringify({
      name,
      dealership: id,
      review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    });

    console.log(jsoninput);
    const res = await fetch(review_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsoninput,
    });

    const json = await res.json();
    if (json.status === 200) {
      window.location.href = `${window.location.origin}/dealer/${id}`;
    }
  }, [model, review, date, year, id, review_url]);

  // Memoized function to fetch dealer info
  const get_dealer = useCallback(async () => {
    const res = await fetch(dealer_url, {
      method: "GET",
    });
    const retobj = await res.json();

    if (retobj.status === 200) {
      let dealerobjs = Array.from(retobj.dealer);
      if (dealerobjs.length > 0) setDealer(dealerobjs[0]);
    }
  }, [dealer_url]);

  // Memoized function to fetch car models
  const get_cars = useCallback(async () => {
    const res = await fetch(carmodels_url, {
      method: "GET",
    });
    const retobj = await res.json();

    let carmodelsarr = Array.from(retobj.CarModels);
    setCarmodels(carmodelsarr);
  }, [carmodels_url]);

  useEffect(() => {
    get_cars();
    get_dealer();
  }, [get_cars, get_dealer]);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>
        <textarea
          id="review"
          cols="50"
          rows="7"
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <div className="input_field">
          Purchase Date{" "}
          <input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="input_field">
          Car Make
          <select
            name="cars"
            id="cars"
            onChange={(e) => setModel(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel, index) => (
              <option key={index} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year{" "}
          <input
            type="number"
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
          />
        </div>

        <div>
          <button className="postreview" onClick={postreview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;

