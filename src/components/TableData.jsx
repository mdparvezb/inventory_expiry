import { useEffect, useState } from "react";
import * as XLSX from "xlsx/xlsx.mjs";
import "../App.css";
import moment from "moment";

const TableData = ( {loading} ) => {
  const [jsonData, setJsonData] = useState([]);
  const [parseData, setParseData] = useState([]);
  const [store, setStore] = useState(null);
  const [storeFilter, setStoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);

// Sort function
const itemSortFn = (a, b) => {
  if(a.itemName < b.itemName) {
    return -1;
  }else if (a.itemName > b.itemName) {
    return 1;
  }
  return 0
}

  const xlHandler = (e) => {
    setJsonData([])
    setParseData([])
    const file = e.target.files[0];
    loading(true)
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let responseData = XLSX.utils.sheet_to_json(sheet, { raw: false });
      responseData = responseData.filter((each) => each.StorageLocation !== 'S079')
      const storeLocation = [
        ...new Set(responseData.map((item) => item.StorageLocationDescription)),
      ];
      setStore(storeLocation);
      responseData.map((data) => {
        // Copy of Data for filtering
        setJsonData((prev) => {
          const savedList = [
            ...prev,
            {
              storeName: data.StorageLocationDescription,
              itemCode: data.Material,
              itemName: data.MaterialDesc,
              batch: data.Batch,
              QTY: Number(data.Quantity),
              costPrice: ((data.TotalCost ? data.TotalCost : 0) / Number(data.Quantity)).toFixed(2) ,
              MRP: ((data.TotalMRP ? data.TotalMRP : 0) / Number(data.Quantity)).toFixed(2) ,
              totalCost: data.TotalCost ? data.TotalCost : 0,
              totalMRP: data.TotalMRP,
              expiry: moment(new Date(data.ExpiryDate)).format('DD.MM.YYYY') ,              
            },
          ];
          return savedList;
        });

        // Copy of Data for filtering
        setParseData((prev) => {
          const savedList = [
            ...prev,
            {
              storeName: data.StorageLocationDescription,
              itemCode: data.Material,
              itemName: data.MaterialDesc,
              batch: data.Batch,
              QTY: Number(data.Quantity),
              costPrice: ((data.TotalCost ? data.TotalCost : 0) / Number(data.Quantity)).toFixed(2) ,
              MRP: ((data.TotalMRP ? data.TotalMRP : 0) / Number(data.Quantity)).toFixed(2) ,
              totalCost: data.TotalCost ? data.TotalCost : 0,
              totalMRP: data.TotalMRP,
              expiry: moment(new Date(data.ExpiryDate)).format('DD.MM.YYYY') , 
            },
          ];
          return savedList;
        });

      });
    loading(false)

    };
    reader.readAsArrayBuffer(file);
  };

  // Onchange function
  useEffect(() => {
    
    if (storeFilter === "all") {
      const data = dateFilter
        ? parseData.filter(
            (each) => Date.parse(each.expiry) <= Date.parse(dateFilter)
          )
        : parseData;
      setJsonData(data);
    }

    if (storeFilter !== "all") {
      const data = dateFilter ? parseData.filter(
        (each) => Date.parse(each.expiry) <= Date.parse(dateFilter)
      ) : parseData
      setJsonData(data.filter((each) => each.storeName === storeFilter));
    }

  }, [dateFilter, storeFilter]);


// Excel Data Download
const DownloadExcel = () => {
  loading(true)
  const worksheet = XLSX.utils.json_to_sheet(jsonData)
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "data");
  XLSX.writeFile(workbook, "Stock.xlsx", { compression: true });
  loading(false)
}



  return (
    <>
      <div className="input-div">
        <h4>Upload SAP Stock:</h4>
        <input accept='.xlsx' type="file" onChange={xlHandler} />
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
          <button id="download" onClick={DownloadExcel}>Download</button>
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
            {jsonData.length > 0 && jsonData.sort(itemSortFn).map((row, index) => (
                <tr key={index + 1}>
                  <td className="centeralign">{index+1}</td>
                  <td className="leftalign">{row.storeName}</td>
                  <td className="centeralign">{row.itemCode}</td>
                  <td className="leftalign">{row.itemName}</td>
                  <td className="centeralign">{row.batch}</td>
                  <td className="centeralign">{row.QTY}</td>
                  <td className="rightalign">
                    {row.costPrice}
                  </td>
                  <td className="rightalign">{row.MRP}</td>
                  <td className="rightalign">
                    {row.totalCost}
                  </td>
                  <td className="centeralign">
                    {row.expiry}
                  </td>
                </tr>
              ))} 
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TableData;
