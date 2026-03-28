import { motion } from "framer-motion";
import { Bell, CalendarClock, ExternalLink, ClipboardCheck } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "Not specified";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not specified";

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// const statusClasses = {
//   draft: "bg-amber-400/10 border border-amber-400/30 text-amber-300",
//   published: "bg-emerald-400/10 border border-emerald-400/30 text-emerald-300",
//   closed: "bg-red-400/10 border border-red-400/30 text-red-300",
//   archived: "bg-slate-400/10 border border-slate-400/30 text-slate-300",
// };

const ExamNotificationsSection = ({ notifications = [], isLoading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Bell size={24} className="text-amber-300" />
        Exam Notifications
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-white/60 text-sm italic">
          No exam notifications yet. You will see invited exams here once sent.
        </p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            // const badgeClass = statusClasses[notification.examStatus] || statusClasses.published;

            return (
              <motion.div
                key={notification.participantId || `${notification.examId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-semibold text-base">{notification.title}</p>
                    <p className="text-xs text-white/50 mt-1">
                      Notified on {formatDateTime(notification.emailSentAt || notification.createdAt)}
                    </p>
                  </div>
                  {/* <span className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wide font-semibold ${badgeClass}`}>
                    {notification.examStatus || "published"}
                  </span> */}
                </div>

                <p className="text-sm text-white/70 mb-3">
                  {notification.description || "No description provided for this exam."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1">Start Date</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <CalendarClock size={14} className="text-accent-cyan" />
                      {formatDateTime(notification.startDate)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-white/50 mb-1">End Date</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <CalendarClock size={14} className="text-accent-blue" />
                      {formatDateTime(notification.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={notification.googleFormLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={15} />
                    Open Exam Form
                  </a>

                  {notification.submitted && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan text-sm font-medium">
                      <ClipboardCheck size={15} />
                      Submitted
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ExamNotificationsSection;
