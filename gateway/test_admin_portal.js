const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AEGIS ADMIN PORTAL & RBAC TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Admin Login
    console.log('[1/8] Testing Admin Login...');
    const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@aegis.ai',
      password: 'Admin@Aegis2026!'
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeded with status 200');
    assert(adminLoginRes.data.user.role === 'admin', 'Admin user has role: "admin"');
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 2. Test Employee Login
    console.log('\n[2/8] Testing Employee Login...');
    const empLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'sarah.connor@aegis.ai',
      password: 'Employee@2026!'
    });
    assert(empLoginRes.status === 200, 'Employee login succeeded with status 200');
    assert(empLoginRes.data.user.role === 'employee', 'Employee user has role: "employee"');
    assert(empLoginRes.data.user.employeeId === 'EMP-1042', 'Employee has stable identifier: EMP-1042');
    const empToken = empLoginRes.data.token;
    const empHeaders = { headers: { Authorization: `Bearer ${empToken}` } };

    // 3. Test Invalid Credentials
    console.log('\n[3/8] Testing Invalid Credentials...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@aegis.ai',
        password: 'WrongPassword123!'
      });
      assert(false, 'Invalid credentials should have failed');
    } catch (err) {
      assert(err.response && err.response.status === 401, 'Invalid credentials correctly returned 401 Unauthorized');
    }

    // 4. Test RBAC: Employee CANNOT access Admin Endpoints
    console.log('\n[4/8] Testing Security Boundary: Employee access to Admin API...');
    try {
      await axios.get(`${BASE_URL}/api/admin/summary`, empHeaders);
      assert(false, 'Employee should NOT access /api/admin/summary');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Employee correctly rejected with 403 Forbidden on /api/admin/summary');
    }

    try {
      await axios.get(`${BASE_URL}/api/admin/employees`, empHeaders);
      assert(false, 'Employee should NOT access /api/admin/employees');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Employee correctly rejected with 403 Forbidden on /api/admin/employees');
    }

    // 5. Test Admin Access to Directory & Summary
    console.log('\n[5/8] Testing Admin Access to Employee Directory & Summary...');
    const summaryRes = await axios.get(`${BASE_URL}/api/admin/summary`, adminHeaders);
    assert(summaryRes.status === 200, 'Admin successfully retrieved system summary');
    assert(summaryRes.data.totalEmployees > 0, `Total employees counted: ${summaryRes.data.totalEmployees}`);
    assert(summaryRes.data.totalAnalyses > 0, `Total prompt analyses recorded: ${summaryRes.data.totalAnalyses}`);

    const employeesRes = await axios.get(`${BASE_URL}/api/admin/employees`, adminHeaders);
    assert(employeesRes.status === 200, 'Admin successfully retrieved employee directory');
    assert(employeesRes.data.employees.length > 0, `Retrieved ${employeesRes.data.employees.length} employees`);
    const targetEmp = employeesRes.data.employees.find(e => e.email === 'sarah.connor@aegis.ai');
    assert(!!targetEmp, 'Sarah Connor found in directory');

    // 6. Test Admin Employee-Specific Security Analytics
    console.log('\n[6/8] Testing Employee-Specific Analytics Dashboard API...');
    const analyticsRes = await axios.get(`${BASE_URL}/api/admin/employees/${targetEmp.employeeId}/analytics`, adminHeaders);
    assert(analyticsRes.status === 200, 'Admin successfully fetched employee-specific analytics');
    const anData = analyticsRes.data;
    assert(anData.employee.employeeId === 'EMP-1042', 'Analytics associated with EMP-1042');
    assert(anData.decisionDistribution.length === 4, 'Decision distribution includes 4 action categories (Pie chart data)');
    assert(anData.dimensionsBreakdown.length > 0, `Dimension breakdown populated with ${anData.dimensionsBreakdown.length} criteria`);
    assert(anData.summary.avgRiskScore >= 0, `Mean risk score calculated: ${(anData.summary.avgRiskScore * 100).toFixed(1)}%`);

    // 7. Test Centralized Registry of Security Dimensions
    console.log('\n[7/8] Testing Extensible Security Dimensions Registry...');
    const dimRes = await axios.get(`${BASE_URL}/api/admin/dimensions`, adminHeaders);
    assert(dimRes.status === 200, 'Dimensions registry retrieved');
    assert(dimRes.data.implementedCount >= 10, `Implemented dimensions: ${dimRes.data.implementedCount}`);
    assert(dimRes.data.plannedCount >= 3, `Planned dimensions: ${dimRes.data.plannedCount}`);

    // 8. Test Scoped History for Employee
    console.log('\n[8/8] Testing Employee Scoped History...');
    const empHistoryRes = await axios.get(`${BASE_URL}/api/history`, empHeaders);
    assert(empHistoryRes.status === 200, 'Employee retrieved personal history');
    const nonEmployeeLogs = empHistoryRes.data.filter(l => l.userEmail && l.userEmail !== 'sarah.connor@aegis.ai');
    assert(nonEmployeeLogs.length === 0, 'No records from other employees leaked to employee history');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test failure:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
}

runTests();
