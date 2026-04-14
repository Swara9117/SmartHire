import React from "react";

function Setting() {
  const settingsSections = [
    {
      title: "Interview Preferences",
      options: [
        "Preferred Interview Type",
        "Difficulty Level",
        "Language Preference",
        "Mock Interview Duration",
        "Enable AI Feedback",
      ],
    },
    {
      title: "Appearance",
      options: [
        "Dark Mode",
        "Font Size",
        "Layout Density",
        "Animation Effects",
        "Theme Selection",
      ],
    },
    {
      title: "Notifications",
      options: [
        "Email Reminders",
        "Interview Summary Reports",
        "Practice Session Alerts",
        "Weekly Progress Updates",
        "Tips & Resources",
      ],
    },
    {
      title: "Account Settings",
      options: [
        "Edit Profile",
        "Change Password",
        "Manage Subscription",
        "Connected Accounts",
        "Delete Account",
      ],
    },
  ];

  return (
    <section className="text-gray-400 bg-gray-900 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="text-center mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium text-white title-font mb-4">
            Settings
          </h1>
          <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-400">
            Customize your InterviewVerse experience. Adjust preferences to get the most out of your practice sessions.
          </p>
        </div>

        <div className="flex flex-wrap -m-4">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="p-4 lg:w-1/4 sm:w-1/2 w-full">
              <h2 className="font-medium title-font tracking-widest text-white mb-4 text-sm text-center sm:text-left">
                {section.title}
              </h2>
              <nav className="flex flex-col sm:items-start sm:text-left text-center items-center -mb-1 space-y-2.5">
                {section.options.map((option, i) => (
                  <a
                    key={i}
                    className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    <span className="bg-indigo-500 text-white w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {option}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Setting;
