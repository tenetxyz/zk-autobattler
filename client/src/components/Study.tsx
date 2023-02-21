import React, { useEffect, useState } from "react";
import { ForwardAuth, useAuth } from "../auth";
import { UserData } from "../models";
import { apiFetch } from "../utils";

import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Spinner } from "react-bootstrap";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";

import "../styles/Study.scss";

interface StudyProps {
  userData: UserData | null;
}

function Study(props: StudyProps) {
  const auth = useAuth();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null);

  const [isLoading, setIsLoading] = useState<any>(true);
  const [allGames, setAllGames] = useState<any>(null);

  const [rowData, setRowData] = useState([]);

  const [columnDefs] = useState([
    { field: "player1_id", flex: 1 },
    { field: "creation1_hash", flex: 1 },
    { field: "player2_id", flex: 1 },
    { field: "creation2_hash", flex: 1 },
    { field: "arena_hash", flex: 1 },
    { field: "result", flex: 1 },
  ]);

  useEffect(() => {
    if (auth && !auth.isLoading && auth.user) {
      apiFetch(
        "games",
        "GET",
        {},
        (body: any, responseData: any) => {
          setAllGames(responseData.games);
        },
        (errorData: any, errorMsg: string) => {
          console.error(errorMsg);
          // alert("API Error: " + errorMsg);
        }
      );
    }
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.showLoadingOverlay();
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  useEffect(() => {
    if (allGames) {
      console.log(allGames);
      gridApi?.setRowData(allGames);
      setIsLoading(false);
      gridApi?.hideOverlay();
    }
  }, [gridApi, allGames]);

  return (
    <div className="pageContainer">
      <div className="pageHeaderWrapper">
        <p className="pageHeader">Completed Games</p>
        {isLoading && <Spinner style={{marginLeft: "20px"}} animation="border" variant={"light"} />}
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: "100%", width: "100%" }}
      >
        <AgGridReact
          pagination={true}
          paginationPageSize={50}
          rowData={rowData}
          rowSelection={"single"}
          defaultColDef={{
            sortable: true,
            resizable: true,
          }}
          headerHeight={30}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
        ></AgGridReact>
      </div>
    </div>
  );
}

export default Study;
