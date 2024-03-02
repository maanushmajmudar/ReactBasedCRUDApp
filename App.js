import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EmployeeDirectory from "./components/EmployeeDirectory";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeCreate from "./components/EmployeeCreate";
import EmployeeUpdate from "./components/Employeeupdate";
import UpcomingRetirement from "./components/UpcomingRetirement";
import { Box } from "@mui/material";

function App() {
  return (
    <Box className="App">
      <Router>
        <Routes>
          <Route element={<EmployeeDirectory />}>
            <Route path="/" element={<EmployeeTable />} />
            <Route path="emp-table/:empType" element={<EmployeeTable />} />
            <Route path="emp-create" element={<EmployeeCreate />} />
            <Route path="/emp-update/:id" element={<EmployeeUpdate />} />
            <Route path="/emp-retirement" element={<UpcomingRetirement />} />
            <Route path="/emp-retirement/:empType" element={<UpcomingRetirement />} />
          </Route>
        </Routes>
      </Router>
    </Box>
  );
}

export default App;
