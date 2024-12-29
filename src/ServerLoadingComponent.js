import Spinner from "react-bootstrap/Spinner";

function ServerLoading() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h5 style={{ textAlign: "center" }}>
        Attempting to connect with server . . .
      </h5>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default ServerLoading;
