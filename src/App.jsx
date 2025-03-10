// import { useEffect, useState } from "react";
// import * as XLSX from "xlsx/xlsx.mjs";
import "./App.css";
import TableData from "./components/TableData";
import Loader from "./components/Loader";
import { useState } from "react";
import Footer from "./components/Footer";

function App() {

  const [loading, setLoading] = useState(false)

  return (
    <>
    <TableData loading={setLoading} />
    {loading && <Loader />}
    <Footer />
    </>
  );
}

export default App;
