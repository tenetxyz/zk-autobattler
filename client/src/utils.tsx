const TENET_API_HOST =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/"
    : "https://api.tenet.com/";

export async function apiFetch(
  endPoint: string,
  method: string,
  body: any,
  successFunc: any,
  errorFunc: any
) {
  var fetchOptions: any = {
    method: method,
  };
  if (method === "POST") {
    fetchOptions = {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };
  }
  fetch(TENET_API_HOST + endPoint, fetchOptions)
    .then((response) => response.json())
    .then((rawData) => {
      if (rawData["error"] !== undefined && rawData["error"] !== "") {
        errorFunc(rawData, "Tenet error");
      } else {
        successFunc(body, rawData);
      }
    })
    .catch((error) => {
      errorFunc(null, error);
    });
}
