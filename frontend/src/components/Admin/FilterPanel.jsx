export default function FilterPanel({ filters, setFilters }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md flex flex-col gap-2">
      <h2 className="font-semibold text-lg">Filter Reports</h2>

      <label>
        <input
          type="checkbox"
          checked={filters.verified}
          onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
        />{" "}
        Verified Only
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.highPriority}
          onChange={(e) => setFilters({ ...filters, highPriority: e.target.checked })}
        />{" "}
        High Priority
      </label>
    </div>
  );
}
