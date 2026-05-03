import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { adminService, expenseService, paymentService, productService, sessionService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';

const PIE_COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6'];

function isoDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function dayKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function fetchAllPaged(getter, baseParams = {}) {
  const pageSize = 200;
  let page = 1;
  let items = [];
  let totalPages = 1;
  do {
    // eslint-disable-next-line no-await-in-loop
    const res = await getter({ ...baseParams, page, pageSize });
    items = items.concat(res.items || []);
    totalPages = res.totalPages || 1;
    page += 1;
  } while (page <= totalPages);
  return items;
}

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return isoDate(d);
  });
  const [dateTo, setDateTo] = useState(() => isoDate(new Date()));
  const [report, setReport] = useState({
    revenue: 0,
    membershipRevenue: 0,
    expenses: 0,
    net: 0,
    paidCount: 0,
    productSalesCount: 0,
    productSalesRevenue: 0,
    expenseCount: 0,
    approvedMembers: 0,
    suspendedMembers: 0,
    daily: [],
    expenseByCategory: [],
    paymentMethodBreakdown: [],
    attendanceByDay: [],
    topAttendanceDay: null,
    topAttendanceRange: null,
    topMemberByAttendance: null,
    fastestPayer: null,
  });

  const applyPreset = (preset) => {
    const now = new Date();
    const to = isoDate(now);
    let fromDate = new Date(now);
    if (preset === '7d') fromDate.setDate(now.getDate() - 6);
    if (preset === '30d') fromDate.setDate(now.getDate() - 29);
    if (preset === 'month') fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateFrom(isoDate(fromDate));
    setDateTo(to);
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const [payments, productSales, expenses, approved, suspended, attendance] = await Promise.all([
        fetchAllPaged((params) => paymentService.getAll(params), { status: 'Paid' }),
        fetchAllPaged((params) => productService.getSales(params)),
        fetchAllPaged((params) => expenseService.getAll(params)),
        adminService.getMembers({ status: 'Approved', page: 1, pageSize: 1 }),
        adminService.getMembers({ status: 'Suspended', page: 1, pageSize: 1 }),
        fetchAllPaged((params) => sessionService.getAttendanceHistory(params), { dateFrom, dateTo }),
      ]);

      const start = new Date(`${dateFrom}T00:00:00`);
      const end = new Date(`${dateTo}T23:59:59`);

      const filteredPayments = payments.filter((p) => {
        if (!p.paidAt) return false;
        const d = new Date(p.paidAt);
        return d >= start && d <= end;
      });
      const filteredExpenses = expenses.filter((e) => {
        const d = new Date(e.expenseDate);
        return d >= start && d <= end;
      });
      const filteredProductSales = productSales.filter((s) => {
        if (!s.isPaid) return false;
        const dt = new Date(s.paidAt || s.createdAt);
        return dt >= start && dt <= end;
      });

      const membershipRevenue = filteredPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
      const productSalesRevenue = filteredProductSales.reduce((s, x) => s + Number(x.paidAmount || 0), 0);
      const revenue = membershipRevenue + productSalesRevenue;
      const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
      const net = revenue - totalExpenses;

      const dayMap = new Map();
      filteredPayments.forEach((p) => {
        const k = dayKey(p.paidAt);
        const prev = dayMap.get(k) || { day: k, revenue: 0, expenses: 0 };
        prev.revenue += Number(p.amount || 0);
        dayMap.set(k, prev);
      });
      filteredProductSales.forEach((s) => {
        const k = dayKey(s.paidAt || s.createdAt);
        const prev = dayMap.get(k) || { day: k, revenue: 0, expenses: 0 };
        prev.revenue += Number(s.paidAmount || 0);
        dayMap.set(k, prev);
      });
      filteredExpenses.forEach((e) => {
        const k = dayKey(e.expenseDate);
        const prev = dayMap.get(k) || { day: k, revenue: 0, expenses: 0 };
        prev.expenses += Number(e.amount || 0);
        dayMap.set(k, prev);
      });
      const daily = Array.from(dayMap.values()).sort((a, b) => (a.day < b.day ? -1 : 1));

      const expenseByCategoryMap = new Map();
      filteredExpenses.forEach((e) => {
        const c = e.category || t('adminReports.otherCategory');
        expenseByCategoryMap.set(c, (expenseByCategoryMap.get(c) || 0) + Number(e.amount || 0));
      });
      const expenseByCategory = Array.from(expenseByCategoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const methodMap = new Map();
      filteredPayments.forEach((p) => {
        const m = p.paymentMethod || t('adminReports.unknown');
        methodMap.set(m, (methodMap.get(m) || 0) + Number(p.amount || 0));
      });
      filteredProductSales.forEach((s) => {
        const m = s.paymentMethod || t('adminReports.unknown');
        methodMap.set(m, (methodMap.get(m) || 0) + Number(s.paidAmount || 0));
      });
      const paymentMethodBreakdown = Array.from(methodMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const attendanceByDayMap = new Map();
      attendance.forEach((a) => {
        const k = a.calendarDate;
        attendanceByDayMap.set(k, (attendanceByDayMap.get(k) || 0) + 1);
      });
      const attendanceByDay = Array.from(attendanceByDayMap.entries())
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => (a.day < b.day ? -1 : 1));

      const topAttendanceDay = attendanceByDay.length
        ? attendanceByDay.reduce((max, d) => (d.count > max.count ? d : max), attendanceByDay[0])
        : null;

      const rangeMap = new Map();
      attendance.forEach((a) => {
        const key = a.arrivalTime || t('adminReports.unknown');
        rangeMap.set(key, (rangeMap.get(key) || 0) + 1);
      });
      const topAttendanceRange = rangeMap.size
        ? Array.from(rangeMap.entries())
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)[0]
        : null;

      const memberMap = new Map();
      attendance.forEach((a) => {
        const key = a.memberId;
        const prev = memberMap.get(key) || { memberId: a.memberId, memberName: a.memberName, count: 0 };
        prev.count += 1;
        memberMap.set(key, prev);
      });
      const topMemberByAttendance = memberMap.size
        ? Array.from(memberMap.values()).sort((a, b) => b.count - a.count)[0]
        : null;

      const payerMap = new Map();
      filteredPayments.forEach((p) => {
        if (!p.paidAt || !p.createdAt) return;
        const diffMs = new Date(p.paidAt).getTime() - new Date(p.createdAt).getTime();
        if (Number.isNaN(diffMs)) return;
        const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));
        const prev = payerMap.get(p.memberId) || { memberId: p.memberId, memberName: p.memberName, totalHours: 0, count: 0 };
        prev.totalHours += diffHours;
        prev.count += 1;
        payerMap.set(p.memberId, prev);
      });
      const fastestPayer = payerMap.size
        ? Array.from(payerMap.values())
          .map((x) => ({ ...x, avgHours: x.totalHours / Math.max(1, x.count) }))
          .sort((a, b) => a.avgHours - b.avgHours)[0]
        : null;

      setReport({
        revenue,
        membershipRevenue,
        expenses: totalExpenses,
        net,
        paidCount: filteredPayments.length,
        productSalesCount: filteredProductSales.length,
        productSalesRevenue,
        expenseCount: filteredExpenses.length,
        approvedMembers: approved.totalCount || 0,
        suspendedMembers: suspended.totalCount || 0,
        daily,
        expenseByCategory,
        paymentMethodBreakdown,
        attendanceByDay,
        topAttendanceDay,
        topAttendanceRange,
        topMemberByAttendance,
        fastestPayer,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      const summaryRows = [
        { Metric: t('adminReports.totalRevenue'), Value: report.revenue },
        { Metric: t('adminReports.membershipRevenue'), Value: report.membershipRevenue },
        { Metric: t('adminReports.totalExpenses'), Value: report.expenses },
        { Metric: t('adminReports.netProfit'), Value: report.net },
        { Metric: t('adminReports.paidPayments'), Value: report.paidCount },
        { Metric: t('adminReports.productSalesCount'), Value: report.productSalesCount },
        { Metric: t('adminReports.productSalesRevenue'), Value: report.productSalesRevenue },
        { Metric: t('adminReports.expenseRecords'), Value: report.expenseCount },
        { Metric: t('adminReports.approvedMembers'), Value: report.approvedMembers },
        { Metric: t('adminReports.suspendedMembers'), Value: report.suspendedMembers },
        { Metric: t('adminReports.topAttendanceDay'), Value: report.topAttendanceDay?.day || '-' },
        { Metric: t('adminReports.topAttendanceRange'), Value: report.topAttendanceRange?.label || '-' },
        { Metric: t('adminReports.topAttendingMember'), Value: report.topMemberByAttendance?.memberName || '-' },
        { Metric: t('adminReports.fastestPayer'), Value: report.fastestPayer?.memberName || '-' },
      ];

      const incomeExpenseRows = report.daily.map((x) => ({
        Day: x.day,
        Revenue: x.revenue,
        Expenses: x.expenses,
        Net: x.revenue - x.expenses,
      }));

      const breakdownRows = [
        ...report.expenseByCategory.map((x) => ({
          Type: 'Expense Category',
          Name: x.name,
          Value: x.value,
        })),
        ...report.paymentMethodBreakdown.map((x) => ({
          Type: 'Payment Method',
          Name: x.name,
          Value: x.value,
        })),
      ];

      const revenueCompositionRows = [
        { Name: t('adminReports.membershipRevenue'), Value: report.membershipRevenue },
        { Name: t('adminReports.productSalesRevenue'), Value: report.productSalesRevenue },
        { Name: t('adminReports.totalRevenue'), Value: report.revenue },
      ];

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeExpenseRows), 'Income Expenses');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueCompositionRows), 'Revenue Breakdown');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(breakdownRows), 'Breakdown');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.expenseByCategory), 'Expense Categories');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.paymentMethodBreakdown), 'Payment Methods');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.attendanceByDay), 'Attendance');

      XLSX.writeFile(wb, `gym-reports-${dateFrom}-to-${dateTo}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const topExpenseCategories = useMemo(() => report.expenseByCategory.slice(0, 6), [report.expenseByCategory]);
  const topPaymentMethods = useMemo(() => report.paymentMethodBreakdown.slice(0, 5), [report.paymentMethodBreakdown]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">{t('adminReports.title')}</h1>
          <p className="text-neutral-400 mt-1">{t('adminReports.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => applyPreset('7d')}>{t('adminReports.last7Days')}</Button>
            <Button size="sm" variant="secondary" onClick={() => applyPreset('30d')}>{t('adminReports.last30Days')}</Button>
            <Button size="sm" variant="secondary" onClick={() => applyPreset('month')}>{t('adminReports.thisMonth')}</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t('adminReports.dateFrom')}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">{t('adminReports.dateTo')}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-2 md:justify-end">
              <Button variant="secondary" onClick={loadReport}>{t('adminReports.applyFilters')}</Button>
              <Button onClick={exportExcel} loading={exporting}>{t('adminReports.exportExcel')}</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label={t('adminReports.totalRevenue')} value={formatCurrency(report.revenue)} accent="text-emerald-400" />
          <MetricCard label={t('adminReports.membershipRevenue')} value={formatCurrency(report.membershipRevenue)} accent="text-lime-400" />
          <MetricCard label={t('adminReports.totalExpenses')} value={formatCurrency(report.expenses)} accent="text-rose-400" />
          <MetricCard label={t('adminReports.netProfit')} value={formatCurrency(report.net)} accent={report.net >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
          <MetricCard label={t('adminReports.productSalesRevenue')} value={formatCurrency(report.productSalesRevenue)} accent="text-cyan-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 sm:p-5">
            <h3 className="text-neutral-200 font-semibold mb-3">{t('adminReports.dailyFinance')}</h3>
            {loading ? <div className="h-64 bg-neutral-900 animate-pulse rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={report.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="day" tick={{ fill: '#737373', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name={t('adminReports.totalRevenue')} stroke="#10b981" fill="#10b98133" />
                  <Area type="monotone" dataKey="expenses" name={t('adminReports.totalExpenses')} stroke="#e11d48" fill="#e11d4833" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 sm:p-5">
            <h3 className="text-neutral-200 font-semibold mb-3">{t('adminReports.expenseCategories')}</h3>
            {loading ? <div className="h-64 bg-neutral-900 animate-pulse rounded-xl" /> : topExpenseCategories.length === 0 ? (
              <p className="text-neutral-500 text-sm">{t('table.noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={topExpenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                    {topExpenseCategories.map((entry, idx) => (
                      <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label={t('adminReports.paidPayments')} value={String(report.paidCount)} />
          <MetricCard label={t('adminReports.productSalesCount')} value={String(report.productSalesCount)} />
          <MetricCard label={t('adminReports.expenseRecords')} value={String(report.expenseCount)} />
          <MetricCard label={t('adminReports.approvedMembers')} value={String(report.approvedMembers)} />
          <MetricCard label={t('adminReports.suspendedMembers')} value={String(report.suspendedMembers)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 sm:p-5">
            <h3 className="text-neutral-200 font-semibold mb-3">{t('adminReports.revenueComposition')}</h3>
            <div className="space-y-3">
              <RowMetric
                label={t('adminReports.membershipRevenue')}
                value={formatCurrency(report.membershipRevenue)}
                tone="text-lime-400"
              />
              <RowMetric
                label={t('adminReports.productSalesRevenue')}
                value={formatCurrency(report.productSalesRevenue)}
                tone="text-cyan-400"
              />
              <RowMetric
                label={t('adminReports.totalRevenue')}
                value={formatCurrency(report.revenue)}
                tone="text-emerald-400"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 sm:p-5">
            <h3 className="text-neutral-200 font-semibold mb-3">{t('adminReports.paymentMethods')}</h3>
            {loading ? <div className="h-28 bg-neutral-900 animate-pulse rounded-xl" /> : topPaymentMethods.length === 0 ? (
              <p className="text-neutral-500 text-sm">{t('table.noData')}</p>
            ) : (
              <div className="space-y-3">
                {topPaymentMethods.map((method) => (
                  <RowMetric
                    key={method.name}
                    label={method.name}
                    value={formatCurrency(method.value)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label={t('adminReports.topAttendanceDay')}
            value={report.topAttendanceDay ? `${report.topAttendanceDay.day} (${report.topAttendanceDay.count})` : '—'}
          />
          <MetricCard
            label={t('adminReports.topAttendanceRange')}
            value={report.topAttendanceRange ? `${report.topAttendanceRange.label} (${report.topAttendanceRange.count})` : '—'}
          />
          <MetricCard
            label={t('adminReports.topAttendingMember')}
            value={report.topMemberByAttendance ? `${report.topMemberByAttendance.memberName} (${report.topMemberByAttendance.count})` : '—'}
          />
          <MetricCard
            label={t('adminReports.fastestPayer')}
            value={report.fastestPayer ? `${report.fastestPayer.memberName} (${formatHours(report.fastestPayer.avgHours)})` : '—'}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function formatHours(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function MetricCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

function RowMetric({ label, value, tone = 'text-neutral-200' }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/40 px-3 py-2.5">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className={`text-sm font-semibold ${tone}`}>{value}</span>
    </div>
  );
}
