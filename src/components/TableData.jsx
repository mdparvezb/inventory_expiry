import { useEffect, useState } from "react";
import * as XLSX from "xlsx/xlsx.mjs";
import "../App.css";
import moment from "moment";

const TableData = ({ loading }) => {
  const [jsonData, setJsonData] = useState([]);
  const [parseData, setParseData] = useState([]);
  const [store, setStore] = useState(null);
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(0);

  // Sort function
  const itemSortFn = (a, b) => {
    if (a.ITEMNAME < b.ITEMNAME) {
      return -1;
    } else if (a.ITEMNAME > b.ITEMNAME) {
      return 1;
    }
    return 0;
  };
  // Excel Upload Handler
  const xlHandler = (e) => {
    setJsonData([]);
    setParseData([]);
    const file = e.target.files[0];
    loading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let responseData = XLSX.utils.sheet_to_json(sheet, { raw: false });
      responseData = responseData.filter(
        (each) => each.StorageLocation !== "S079"
      );
      const storeLocation = [
        ...new Set(responseData.map((item) => item.StorageLocationDescription)),
      ];
      setStore(storeLocation);
      responseData.map((data) => {
        // Main Data for Display
        setJsonData((prev) => {
          const savedList = [
            ...prev,
            {
              STORENAME: data.StorageLocationDescription,
              ITEMCODE: data.Material,
              ITEMNAME: data.MaterialDesc,
              BATCH: data.Batch,
              QTY: Number(data.Quantity),
              COSTPRICE: (
                (Number(data.TotalCost) ? Number(data.TotalCost) : 0) /
                Number(data.Quantity)
              ).toFixed(2),
              MRP: (
                (Number(data.TotalMRP) ? Number(data.TotalMRP) : 0) /
                Number(data.Quantity)
              ).toFixed(2),
              TOTALCOSTPRICE: Number(data.TotalCost)
                ? Number(data.TotalCost)
                : 0,
              TOTALMRP: Number(data.TotalMRP),
              EXPIRY: moment(new Date(data.ExpiryDate)).format("YYYY-MM-DD"),
            },
          ];
          return savedList;
        });

        // Copy of Data for filtering
        setParseData((prev) => {
          const savedList = [
            ...prev,
            {
              STORENAME: data.StorageLocationDescription,
              ITEMCODE: data.Material,
              ITEMNAME: data.MaterialDesc,
              BATCH: data.Batch,
              QTY: Number(data.Quantity),
              COSTPRICE: (
                (Number(data.TotalCost) ? Number(data.TotalCost) : 0) /
                Number(data.Quantity)
              ).toFixed(2),
              MRP: (
                (Number(data.TotalMRP) ? Number(data.TotalMRP) : 0) /
                Number(data.Quantity)
              ).toFixed(2),
              TOTALCOSTPRICE: Number(data.TotalCost)
                ? Number(data.TotalCost)
                : 0,
              TOTALMRP: Number(data.TotalMRP),
              EXPIRY: moment(new Date(data.ExpiryDate)).format("YYYY-MM-DD"),
            },
          ];
          return savedList;
        });
      });
      loading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  // Onchange function
  useEffect(() => {
    if (storeFilter === "all") {
      const data = dateFilter
        ? parseData.filter(
            (each) =>
              moment(new Date(each.EXPIRY)).format("YYYY-MM-DD") <= dateFilter
          )
        : parseData;
      setJsonData(data);
    }

    if (storeFilter !== "all") {
      const data = dateFilter
        ? parseData.filter(
            (each) =>
              moment(new Date(each.EXPIRY)).format("YYYY-MM-DD") <= dateFilter
          )
        : parseData;
      setJsonData(data.filter((each) => each.STORENAME === storeFilter));
    }
  }, [dateFilter, storeFilter]);

  useEffect(() => {
    setInventoryValue(
      jsonData.reduce(
        (acc, curr) => Number(acc) + Number(curr.TOTALCOSTPRICE),
        0
      )
    );
  }, [jsonData]);

  // Excel Data Download
  const DownloadExcel = () => {
    loading(true);
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${storeFilter}`);
    XLSX.writeFile(workbook, `${storeFilter} Stock.xlsx`, {
      compression: true,
    });
    loading(false);
  };

  return (
    <>
      <div className="input-div">
        <div className="upload-box">
          <h4>Upload SAP Stock:</h4>
          <input accept=".xlsx" type="file" onChange={xlHandler} />
        </div>
        <div className="inventory-div">
          <span className="inventory-name">Inventory Value:</span>
          <span className="inventory-value">{Math.round(inventoryValue)}</span>
        </div>
      </div>

      <div className="filters">
        <div>
          <span>Expiry till:</span>
          <input
            onChange={(e) => setDateFilter(e.target.value)}
            defaultValue={dateFilter}
            type="date"
          />
        </div>
        <div>
          <span>Stock by S.Location</span>
          <select onChange={(e) => setStoreFilter(e.target.value)}>
            <option value="all">All</option>
            {store &&
              store.map((s, index) => (
                <option key={index} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>
        <div>
          <button
            id="download"
            onClick={DownloadExcel}
            disabled={jsonData.length > 0 ? false : true}
          >
            Download Excel
          </button>
        </div>
      </div>

      <div className="table-div">
        <table>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>S.LOC</th>
              <th>ITEM CODE</th>
              <th>ITEM NAME</th>
              <th>BATCH</th>
              <th>QTY</th>
              <th>COST PRICE</th>
              <th>MRP</th>
              <th>TOTAL COST</th>
              <th>EXPIRY</th>
            </tr>
          </thead>

          <tbody>
            {jsonData.length > 0 &&
              jsonData.sort(itemSortFn).map((row, index) => (
                <tr key={index + 1}>
                  <td className="centeralign">{index + 1}</td>
                  <td className="leftalign">{row.STORENAME}</td>
                  <td className="centeralign">{row.ITEMCODE}</td>
                  <td className="leftalign">{row.ITEMNAME}</td>
                  <td className="centeralign">{row.BATCH}</td>
                  <td className="centeralign">{row.QTY}</td>
                  <td className="rightalign">{row.COSTPRICE}</td>
                  <td className="rightalign">{row.MRP}</td>
                  <td className="rightalign">{row.TOTALCOSTPRICE}</td>
                  <td className="centeralign">
                    {moment(new Date(row.EXPIRY)).format("DD-MM-YYYY")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableData;
