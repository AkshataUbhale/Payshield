import { Search } from "lucide-react";
import { useState } from "react";
import JobCard from "./JobCard";

export default function JobList({ jobs = [], onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={15} style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)"
        }} />
        <input
          className="form-input input-with-icon"
          placeholder="Search jobs or skills…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
        {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map(job => (
          <JobCard key={job.id} job={job} onClick={() => onSelect && onSelect(job)} />
        ))}
        {!filtered.length && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            No jobs match your search.
          </div>
        )}
      </div>
    </div>
  );
}
