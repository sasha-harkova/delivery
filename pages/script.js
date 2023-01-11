import arrayOfAddresses from "../utils/arrayOfAddresses.js";
import FormValidator from "../components/FormValidator.js";
const pickupCitiesContainer = document.querySelector(".pickup__city-list");
const courierCitiesContainer = document.querySelector(".courier__city-list");
const addressesContainer = document.querySelector(".pickup__address-list");
const pickupMethod = document.querySelector(".method_type_pickup");
const courierMethod = document.querySelector(".method_type_courier");
const addressForm = document.forms.addressForm;
const paymentForm = document.forms.paymentForm;


//----------------ВАЛИДАЦИЯ----------------

const validationPaymentForm = new FormValidator(paymentForm);
validationPaymentForm.enableValidation();

const validationAddressForm = new FormValidator(addressForm);
validationAddressForm.enableValidation();


//----------------ВЫБОР СПОСОБА ДОСТАВКИ----------------

const allMethods = [
  {
    method: pickupMethod,
    methodName: "pickup",
  },
  {
    method: courierMethod,
    methodName: "courier",
  },
];

function checkMethodState(method, methodName) {
  if (method.classList.contains("method_active")) {
    method.style.backgroundImage = "url(images/background.jpg)";
    method.querySelector(".method__title").style.color = "#ffffff";
    method.querySelector(
      `.method__image_type_${methodName}`
    ).style.backgroundImage = `url(images/${methodName}_type_white.png)`;
    document.querySelector(`.${methodName}`).style.display = "block";
  } else {
    method.style.backgroundImage = "";
    method.querySelector(".method__title").style.color = "#3b3b3b";
    method.querySelector(
      `.method__image_type_${methodName}`
    ).style.backgroundImage = `url(images/${methodName}.png)`;
    document.querySelector(`.${methodName}`).style.display = "none";
  }
}
checkMethodState(pickupMethod, "pickup");

function setEventListenerOnMethod(method, methodName) {
  method.addEventListener("click", () => {
    allMethods.forEach((item) => {
      item.method.classList.remove("method_active");
      checkMethodState(item.method, item.methodName);
    });
    method.classList.add("method_active");
    checkMethodState(method, methodName);
  });
}

allMethods.forEach((item) => {
  setEventListenerOnMethod(item.method, item.methodName);
});

//----------------УНИВЕРСАЛЬНАЯ ФУНКЦИЯ СОЗДАНИЯ СПИСКА----------------

function createCitiesOrAddressList(item, container) {
  const newElement = document.createElement("li");
  newElement.classList.add("list-item");
  newElement.textContent = item;
  newElement.textContent === "Москва"
    ? newElement.classList.add("list-item_active")
    : "";
  container.append(newElement);
}

//----------------СОЗДАНИЕ КАРТЫ----------------

let mapOptions = {
  center: [55.7536, 37.621184],
  zoom: 11,
  attributionControl: false,
};
let map = new L.map("map", mapOptions);
let layer = new L.TileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
);
map.addLayer(layer);

//----------------РЕНДЕРИНГ СПИСКА ГОРОДОВ И УЛИЦ----------------

function renderCitiesList(container) {
  arrayOfAddresses.forEach((item) => {
    createCitiesOrAddressList(item.city, container);
  });
}
renderCitiesList(pickupCitiesContainer);
renderCitiesList(courierCitiesContainer);

function renderAddressList(city) {
  if (city.classList.contains("list-item_active")) {
    arrayOfAddresses.forEach((item) => {
      if (city.textContent === item.city) {
        item.streets.forEach((address) => {
          createCitiesOrAddressList(address.street, addressesContainer);
          let allAddressesOfPickUp =
            addressesContainer.querySelectorAll(".list-item");
          new L.Marker(address.coordinates)
            .bindPopup(`${address.street}`)
            .openPopup()
            .addTo(map);
          chooseStreet(allAddressesOfPickUp);
        });
      }
    });
  }
}

//----------------ВЫБОР НУЖНОГО ГОРОДА ИЛИ УЛИЦЫ----------------

function choosePlace(item, list) {
  list.forEach((item) => item.classList.remove("list-item_active"));
  item.classList.add("list-item_active");
}

function chooseStreet(list) {
  list.forEach((item) => {
    item.addEventListener("click", () => {
      choosePlace(item, list);
      arrayOfAddresses.forEach((city) => {
        city.streets.forEach((street) => {
          if (item.textContent == street.street) {
            map.flyTo(street.coordinates, 15);
          }
        });
      });
    });
  });
}

const allCitiesOfPickup = pickupCitiesContainer.querySelectorAll(".list-item");
const allCitiesOfCourier =
  courierCitiesContainer.querySelectorAll(".list-item");

allCitiesOfCourier.forEach((item) => {
  renderAddressList(item);
  item.addEventListener("click", () => choosePlace(item, allCitiesOfCourier));
});

allCitiesOfPickup.forEach((item) => {
  item.addEventListener("click", () => {
    addressesContainer.innerHTML = "";
    choosePlace(item, allCitiesOfPickup);
    renderAddressList(item);
    arrayOfAddresses.forEach((address) => {
      if (item.textContent === address.city) {
        map.setView(address.coordinates, 11, { animation: true });
      }
    });
  });
});

//----------------СЛАЙДЕР----------------

$(".courier__time-slider").slider({
  range: true,
  min: 600,
  max: 1200,
  step: 30,
  values: [720, 1020],
  slide: function (event, ui) {
    var hours1 = Math.floor(ui.values[0] / 60);
    var minutes1 = ui.values[0] - hours1 * 60;

    if (minutes1 == 0) minutes1 = "00";

    var hours2 = Math.floor(ui.values[1] / 60);
    var minutes2 = ui.values[1] - hours2 * 60;

    if (minutes2 == 0) minutes2 = "00";

    $(".courier__time").text(
      `${hours1}:${minutes1} - ${hours2}:${minutes2}`
    );
  },
});

//----------------ВЫБОР МЕТОДА ДОСТАВКИ----------------

const paymentMethods = document.querySelectorAll(".payment__method");
const inputForCardNumber = document.querySelector(".payment-form__inputs_type_by-card");

paymentMethods.forEach((method) => {
  method.addEventListener("click", () => {
    choosePlace(method, paymentMethods);
    if (method.classList.contains("payment__method_type_by-cash")) {
      inputForCardNumber.style.display = "none";
    } else {
      inputForCardNumber.style.display = "block";
    }
  });
});

//----------------АВТОЗАПОЛНЕНИЕ----------------

$("#date").on("change keyup paste", function (e) {
  if (e.keyCode != 8) {
    let output;
    let input = $("#date").val();
    input = input.replace(/[^0-9]/g, "");
    let day = input.substr(0, 2);
    let mon = input.substr(2, 2);
    let year = input.substr(4, 4);
    if (day.length < 2) {
      output = day;
    } else if (day.length == 2 && mon.length < 2) {
      output = day + "." + mon;
    } else if (day.length == 2 && mon.length == 2) {
      output = day + "." + mon + "." + year;
    }
    $("#date").val(output);
  }
});

$("#phone-number").on("change keyup paste", function (e) {
  if (e.keyCode != 8) {
    let output;
    let input = $("#phone-number").val();
    input = input.replace(/[^0-9]/g, "");
    let area = input.substr(0, 3);
    let pre = input.substr(3, 3);
    let tel = input.substr(6, 4);
    if (area.length < 3) {
      output = "(" + area;
    } else if (area.length == 3 && pre.length < 3) {
      output = "(" + area + ")" + " " + pre;
    } else if (area.length == 3 && pre.length == 3) {
      output = "(" + area + ")" + " " + pre + "-" + tel;
    }
    $("#phone-number").val(output);
  }
});


