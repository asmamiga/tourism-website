// import React, { useMemo } from 'react';
// import { BarChart } from '@mui/x-charts/BarChart';
// import { useTheme } from '@mui/material/styles';
// import { useTheme } from '@mui/material/styles';

// const TransactionBarChart = ({ transactions, title = "Transaction Analytics" }) => {
//   const theme = useTheme();
//   const isDarkMode = theme.palette.mode === 'dark';

//   // Process transaction data for the chart
//   const chartData = useMemo(() => {
//     // Group transactions by categories (e.g., by month, payment status, or flight)
//     // For this example, let's group by payment status
//     const paidTransactions = transactions.filter(t => t.payment_status === 'paid');
//     const pendingTransactions = transactions.filter(t => t.payment_status === 'pending');

//     // Calculate total revenue per month, assuming transactions have created_at field
//     const monthlyData = {};
    
//     transactions.forEach(transaction => {
//       // Extract month from transaction date
//       const date = transaction.created_at ? new Date(transaction.created_at) : new Date();
//       const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
//       if (!monthlyData[monthKey]) {
//         monthlyData[monthKey] = {
//           month: monthKey,
//           paid: 0,
//           pending: 0
//         };
//       }
      
//       if (transaction.payment_status === 'paid') {
//         monthlyData[monthKey].paid += parseFloat(transaction.grandtotal || 0);
//       } else {
//         monthlyData[monthKey].pending += parseFloat(transaction.grandtotal || 0);
//       }
//     });

//     // Convert to array and sort by month
//     return Object.values(monthlyData)
//       .sort((a, b) => a.month.localeCompare(b.month))
//       .map(item => ({
//         ...item,
//         // Format month for display (e.g., "2023-1" to "Jan")
//         label: new Date(item.month + '-01').toLocaleString('default', { month: 'short' })
//       }));
//   }, [transactions]);

//   // Chart styling based on mode
//   const chartColors = {
//     paid: isDarkMode ? '#3498db' : '#2196f3',
//     pending: isDarkMode ? '#5dade2' : '#90caf9'
//   };

//   // Extract data series for chart
//   const months = chartData.map(item => item.label);
//   const paidSeries = chartData.map(item => item.paid);
//   const pendingSeries = chartData.map(item => item.pending);

//   return (
//     <div style={{ 
//       width: '100%', 
//       height: 300,
//       padding: '1rem',
//       backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
//       borderRadius: '8px',
//       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//       color: isDarkMode ? '#ffffff' : '#333333'
//     }}>
//       <h3 style={{ 
//         marginBottom: '1rem',
//         textAlign: 'center',
//         color: isDarkMode ? '#ffffff' : '#333333' 
//       }}>
//         {title}
//       </h3>
      
//       {chartData.length > 0 ? (
//         <BarChart
//           dataset={chartData}
//           xAxis={[{ 
//             scaleType: 'band', 
//             dataKey: 'label',
//             tickLabelStyle: {
//               fill: isDarkMode ? '#ffffff' : '#333333',
//             }
//           }]}
//           yAxis={[{ 
//             tickLabelStyle: {
//               fill: isDarkMode ? '#ffffff' : '#333333',
//             }
//           }]}
//           series={[
//             { 
//               dataKey: 'paid', 
//               label: 'Paid', 
//               color: chartColors.paid,
//               valueFormatter: (value) => `$${value.toLocaleString()}`
//             },
//             { 
//               dataKey: 'pending', 
//               label: 'Pending', 
//               color: chartColors.pending,
//               valueFormatter: (value) => `$${value.toLocaleString()}`
//             }
//           ]}
//           legend={{ 
//             position: 'top',
//             labelStyle: {
//               fill: isDarkMode ? '#ffffff' : '#333333',
//             }
//           }}
//           tooltip={{ 
//             trigger: 'item',
//             backgroundColor: isDarkMode ? '#333333' : '#ffffff',
//             textStyle: {
//               color: isDarkMode ? '#ffffff' : '#333333'
//             }
//           }}
//           height={220}
//           margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
//           slotProps={{
//             bar: {
//               borderRadius: 4,
//             },
//           }}
//         />
//       ) : (
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center', 
//           height: '80%',
//           color: isDarkMode ? '#aaaaaa' : '#666666'
//         }}>
//           No transaction data available
//         </div>
//       )}
//     </div>
//   );
// };

// export default TransactionBarChart;