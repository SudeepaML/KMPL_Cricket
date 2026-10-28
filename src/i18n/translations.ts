/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bilingual string dictionaries for English (en) and Kannada (kn).
 * Provides instant switching without page reloads.
 */

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  directory: string;
  monthlyFund: string;
  baddiChitti: string;
  cumulativeReport: string;
  adminPanel: string;
  playerPortal: string;
  login: string;
  logout: string;
  searchPlayer: string;
  searchPlaceholder: string;
  totalMembers: string;
  seniorMember: string;
  juniorMember: string;
  monthlyContribution: string;
  joinDate: string;
  chittiStatus: string;
  taken: string;
  notTaken: string;
  paid: string;
  pending: string;
  overdue: string;
  active: string;
  principal: string;
  interest: string;
  totalReturn: string;
  lendingMonth: string;
  repaymentDue: string;
  shareLoan: string;
  grandTotal: string;
  totalFundCollected: string;
  totalInterestEarned: string;
  closedMonth: string;
  lockedMonth: string;
  countdownToDeadline: string;
  deadlineNotice: string;
  collectFund: string;
  closeMonthAction: string;
  borrowChitti: string;
  repayChitti: string;
  manageAdmins: string;
  managePlayers: string;
  cash: string;
  upi: string;
  upiRef: string;
  submit: string;
  cancel: string;
  developerAuthRequired: string;
  developerPhonePrompt: string;
  verify: string;
  adminOfficerList: string;
  otpSentMessage: string;
  enterOtp: string;
  verifyAndLogin: string;
  selectAdmin: string;
  rulesAndRegulations: string;
  rulesTitle: string;
  rulesSubtitle: string;
  userGuide: string;
  userGuideSubtitle: string;
  noPlayerLoginNotice: string;
  authSuccess: string;
  authFailed: string;
  manageRules: string;
  officerIdentifier: string;
  officerPinOrPassword: string;
  enterCredentials: string;
  lockSession: string;
  lockAndExit: string;
  officerEmailLabel: string;
  sendEmailOtp: string;
  emailOtpNotice: string;
  checkInboxMessage: string;
  chat: string;
  chatSubtitle: string;
  noMessagesYet: string;
  typeMessagePlaceholder: string;
  send: string;
  waitCooldown: string;
  loginToChat: string;
  identifyAsPlayer: string;
  selectYourPlayer: string;
  changePlayer: string;
  deleteMessage: string;
  deleteConfirm: string;
  adminBadge: string;
  announcements: string;
  announcementsSubtitle: string;
  noAnnouncementsYet: string;
  newAnnouncement: string;
  postAnnouncement: string;
  announcementTitle: string;
  announcementBody: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  pinAnnouncement: string;
  unpinAnnouncement: string;
  pinnedNotice: string;
  deleteAnnouncement: string;
  deleteAnnouncementConfirm: string;
  postedBy: string;
  announcementPostedSuccess: string;
  viewAllAnnouncements: string;
  latestAnnouncement: string;
  noPlayersYet: string;
}

export const translations: Record<'en' | 'kn', TranslationDictionary> = {
  en: {
    appTitle: "KMPL Cricket",
    appSubtitle: "Kagalagere Megala Hatti Premier League",
    directory: "Player Directory",
    monthlyFund: "Monthly Fund",
    baddiChitti: "Baddi Chitti",
    cumulativeReport: "Cumulative Report",
    adminPanel: "Admin Panel",
    playerPortal: "Player Portal",
    login: "Admin Login",
    logout: "Sign Out",
    searchPlayer: "Search Member",
    searchPlaceholder: "Search by Name, KMPL ID or Phone...",
    totalMembers: "Total Members",
    seniorMember: "Senior (₹200/mo)",
    juniorMember: "Junior (₹100/mo)",
    monthlyContribution: "Monthly Contribution",
    joinDate: "Join Date",
    chittiStatus: "Chitti Loan Status",
    taken: "Chitti Taken",
    notTaken: "No Active Loan",
    paid: "PAID",
    pending: "PENDING",
    overdue: "OVERDUE",
    active: "ACTIVE",
    principal: "Principal Amount",
    interest: "10% Interest",
    totalReturn: "Total Return Due",
    lendingMonth: "Lending Month",
    repaymentDue: "Repayment Due Date",
    shareLoan: "Share Summary",
    grandTotal: "Tournament Grand Total",
    totalFundCollected: "Total Monthly Amount",
    totalInterestEarned: "Total Baddi Chitti",
    closedMonth: "Closed Month",
    lockedMonth: "Month Locked",
    countdownToDeadline: "Countdown to 15th Deadline",
    deadlineNotice: "Collection deadline is on the 15th of each month.",
    collectFund: "Collect Monthly Fund",
    closeMonthAction: "Close Month",
    borrowChitti: "Issue Chitti Loan",
    repayChitti: "Repay Chitti Loan",
    manageAdmins: "Manage Officers",
    managePlayers: "Manage Players",
    cash: "Cash",
    upi: "UPI",
    upiRef: "UPI Reference No",
    submit: "Save & Submit",
    cancel: "Cancel",
    developerAuthRequired: "Developer Authorization Required",
    developerPhonePrompt: "Enter Developer Phone Number to authorize this action",
    verify: "Verify & Authorize",
    adminOfficerList: "Registered Tournament Officers",
    otpSentMessage: "6-digit OTP code sent to your registered email.",
    enterOtp: "Enter 6-Digit OTP",
    verifyAndLogin: "Verify & Sign In",
    selectAdmin: "Select Registered Officer",
    rulesAndRegulations: "Rules & Regulations",
    rulesTitle: "Tournament Fund Rules & Regulations",
    rulesSubtitle: "Official KMPL financial policies, contribution tiers, and loan regulations",
    userGuide: "User Guide",
    userGuideSubtitle: "How to use KMPL Cricket website & transparency portal",
    noPlayerLoginNotice: "No login or password needed for players and villagers! Transparent public ledger.",
    authSuccess: "Authentication Successful",
    authFailed: "Authentication Failed",
    manageRules: "Fund Rules & Regulations",
    officerIdentifier: "Registered Officer Email or Phone",
    officerPinOrPassword: "Officer Security PIN / Password",
    enterCredentials: "Enter Admin Credentials",
    lockSession: "Lock Session",
    lockAndExit: "Lock & Sign Out",
    officerEmailLabel: "Officer Registered Email Address",
    sendEmailOtp: "Send OTP to Email",
    emailOtpNotice: "Supabase Email OTP Authentication",
    checkInboxMessage: "Check your email inbox for the 6-digit OTP code sent via Supabase.",
    chat: "Community Chat",
    chatSubtitle: "Official village tournament discussion, banter & player updates",
    noMessagesYet: "No messages yet. Say hello!",
    typeMessagePlaceholder: "Type a message (max 500 characters)...",
    send: "Send",
    waitCooldown: "Wait",
    loginToChat: "Sign in as a Player or Admin to participate in the chat",
    identifyAsPlayer: "Identify as Player",
    selectYourPlayer: "Select Your Player Profile",
    changePlayer: "Change Player",
    deleteMessage: "Delete Message",
    deleteConfirm: "Are you sure you want to delete this message as an admin?",
    adminBadge: "Admin",
    announcements: "Announcements",
    announcementsSubtitle: "Official tournament notices, ground updates, and schedules",
    noAnnouncementsYet: "No announcements yet.",
    newAnnouncement: "New Announcement",
    postAnnouncement: "Publish Announcement",
    announcementTitle: "Announcement Title",
    announcementBody: "Announcement Details",
    titlePlaceholder: "e.g., Match schedule updated or kit distribution...",
    bodyPlaceholder: "Enter complete announcement details (max 1000 characters)...",
    pinAnnouncement: "Pin Announcement",
    unpinAnnouncement: "Unpin",
    pinnedNotice: "Pinned Announcement",
    deleteAnnouncement: "Delete Announcement",
    deleteAnnouncementConfirm: "Are you sure you want to delete this announcement? This action cannot be undone.",
    postedBy: "Posted by",
    announcementPostedSuccess: "Announcement published successfully!",
    viewAllAnnouncements: "View All Announcements",
    latestAnnouncement: "Latest Announcement",
    noPlayersYet: "No players yet",
  },
  kn: {
    appTitle: "ಕೆಎಂಪಿಎಲ್ ಕ್ರಿಕೆಟ್",
    appSubtitle: "ಕಾಗಲಗೆರೆ ಮೇಗಳ ಹಟ್ಟಿ ಪ್ರೀಮಿಯರ್ ಲೀಗ್",
    directory: "ಆಟಗಾರರ ವಿವರ",
    monthlyFund: "ಮಾಸಿಕ ಫಂಡ್",
    baddiChitti: "ಬಡ್ಡಿ ಚಿಟ್ಟಿ",
    cumulativeReport: "ಒಟ್ಟು ಲೆಕ್ಕ ವರದಿ",
    adminPanel: "ಅಡ್ಮಿನ್ ವಿಭಾಗ",
    playerPortal: "ಆಟಗಾರರ ಪೋರ್ಟಲ್",
    login: "ಅಡ್ಮಿನ್ ಲಾಗಿನ್",
    logout: "ಹೊರಹೋಗಿ",
    searchPlayer: "ಆಟಗಾರರ ಹುಡುಕಾಟ",
    searchPlaceholder: "ಹೆಸರು, ಕೆಎಂಪಿಎಲ್ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ...",
    totalMembers: "ಒಟ್ಟು ಸದಸ್ಯರು",
    seniorMember: "ಹಿರಿಯರು (ತಿಂಗಳಿಗೆ ₹200)",
    juniorMember: "ಕಿರಿಯರು (ತಿಂಗಳಿಗೆ ₹100)",
    monthlyContribution: "ಮಾಸಿಕ ದೇಣಿಗೆ",
    joinDate: "ಸೇರ್ಪಡೆ ದಿನಾಂಕ",
    chittiStatus: "ಚಿಟ್ಟಿ ಸ್ಥಿತಿ",
    taken: "ಚಿಟ್ಟಿ ಪಡೆದಿದ್ದಾರೆ",
    notTaken: "ಚಿಟ್ಟಿ ಪಡೆದಿಲ್ಲ",
    paid: "ಪಾವತಿಸಲಾಗಿದೆ",
    pending: "ಬಾಕಿ ಇದೆ",
    overdue: "ಅವಧಿ ಮೀರಿದೆ",
    active: "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
    principal: "ಮೂಲ ಸಾಲ",
    interest: "10% ಬಡ್ಡಿ",
    totalReturn: "ಮರುಪಾವತಿ ಒಟ್ಟು ಮೊತ್ತ",
    lendingMonth: "ನೀಡಿದ ತಿಂಗಳು",
    repaymentDue: "ಮರುಪಾವತಿ ಅಂತಿಮ ದಿನಾಂಕ",
    shareLoan: "ವಿವರ ಹಂಚಿಕೊಳ್ಳಿ",
    grandTotal: "ಟೂರ್ನಮೆಂಟ್ ಒಟ್ಟು ಹಣ",
    totalFundCollected: "ಒಟ್ಟು ಮಾಸಿಕ ಫಂಡ್",
    totalInterestEarned: "ಒಟ್ಟು ಬಡ್ಡಿ ಆದಾಯ",
    closedMonth: "ಮುಕ್ತಾಯವಾದ ತಿಂಗಳು",
    lockedMonth: "ಲಾಕ್ ಆದ ತಿಂಗಳು",
    countdownToDeadline: "15 ನೇ ತಾರೀಖಿನ ಅಂತಿಮ ಗಡುವು",
    deadlineNotice: "ಪ್ರತಿ ತಿಂಗಳ 15 ನೇ ತಾರೀಖು ಹಣ ಪಾವತಿಯ ಕೊನೆಯ ದಿನ.",
    collectFund: "ಮಾಸಿಕ ಹಣ ಸಂಗ್ರಹ",
    closeMonthAction: "ತಿಂಗಳು ಲಾಕ್ ಮಾಡಿ",
    borrowChitti: "ಚಿಟ್ಟಿ ಸಾಲ ನೀಡಿ",
    repayChitti: "ಚಿಟ್ಟಿ ಸಾಲ ಮರುಪಾವತಿ",
    manageAdmins: "ಅಧಿಕಾರಿಗಳ ನಿರ್ವಹಣೆ",
    managePlayers: "ಆಟಗಾರರ ನಿರ್ವಹಣೆ",
    cash: "ನಗದು (Cash)",
    upi: "ಯುಪಿಐ (UPI)",
    upiRef: "ಯುಪಿಐ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ",
    submit: "ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    developerAuthRequired: "ಡೆವಲಪರ್ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ",
    developerPhonePrompt: "ದೃಢೀಕರಿಸಲು ಡೆವಲಪರ್ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    verify: "ದೃಢೀಕರಿಸಿ ಮುಂದುವರಿಯಿರಿ",
    adminOfficerList: "ನೋಂದಾಯಿತ ಟೂರ್ನಮೆಂಟ್ ಅಧಿಕಾರಿಗಳು",
    otpSentMessage: "ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    enterOtp: "6-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ",
    verifyAndLogin: "ಪರಿಶೀಲಿಸಿ ಲಾಗಿನ್ ಆಗಿ",
    selectAdmin: "ಅಧಿಕಾರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    rulesAndRegulations: "ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳು",
    rulesTitle: "ಟೂರ್ನಮೆಂಟ್ ಫಂಡ್ ನಿಯಮಗಳು & ನಿಬಂಧನೆಗಳು",
    rulesSubtitle: "ಅಧಿಕೃತ ಕೆಎಂಪಿಎಲ್ ಆರ್ಥಿಕ ನೀತಿಗಳು, ದೇಣಿಗೆ ಮತ್ತು ಸಾಲದ ನಿಯಮಗಳು",
    userGuide: "ಬಳಕೆದಾರರ ಮಾರ್ಗದರ್ಶಿ",
    userGuideSubtitle: "ಕೆಎಂಪಿಎಲ್ ಕ್ರಿಕೆಟ್ ವೆಬ್‌ಸೈಟ್ ಬಳಸುವ ವಿಧಾನ ಮತ್ತು ಮಾಹಿತಿ",
    noPlayerLoginNotice: "ಆಟಗಾರರಿಗೆ ಮತ್ತು ಗ್ರಾಮಸ್ಥರಿಗೆ ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ! ಮುಕ್ತ ಪಾರದರ್ಶಕ ವರದಿ.",
    authSuccess: "ದೃಢೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ",
    authFailed: "ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ",
    manageRules: "ಫಂಡ್ ನಿಯಮಗಳ ನಿರ್ವಹಣೆ",
    officerIdentifier: "ನೋಂದಾಯಿತ ಅಧಿಕಾರಿಯ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    officerPinOrPassword: "ಅಧಿಕಾರಿ ಸೆಕ್ಯೂರಿಟಿ ಪಿನ್ / ಪಾಸ್‌ವರ್ಡ್",
    enterCredentials: "ಅಡ್ಮಿನ್ ರುಜುವಾತು ನಮೂದಿಸಿ",
    lockSession: "ಲಾಕ್ ಮಾಡಿ",
    lockAndExit: "ಲಾಕ್ ಮಾಡಿ ನಿರ್ಗಮಿಸಿ",
    officerEmailLabel: "ನೋಂದಾಯಿತ ಅಧಿಕಾರಿಯ ಇಮೇಲ್ ವಿಳಾಸ",
    sendEmailOtp: "ಇಮೇಲ್‌ಗೆ ಒಟಿಪಿ ಕಳುಹಿಸಿ",
    emailOtpNotice: "ಸುಪಬೇಸ್ ಇಮೇಲ್ ಒಟಿಪಿ ದೃಢೀಕರಣ",
    checkInboxMessage: "ಸುಪಬೇಸ್ ಮೂಲಕ ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6-ಅಂಕಿಯ ಒಟಿಪಿ ಕೋಡ್ ಪರಿಶೀಲಿಸಿ.",
    chat: "ಸಮುದಾಯ ಚಾಟ್",
    chatSubtitle: "ಅಧಿಕೃತ ಗ್ರಾಮ ಕ್ರಿಕೆಟ್ ಟೂರ್ನಮೆಂಟ್ ಚರ್ಚೆ ಮತ್ತು ಆಟಗಾರರ ಲೈವ್ ಸಂದೇಶಗಳು",
    noMessagesYet: "No messages yet. Say hello!",
    typeMessagePlaceholder: "ಸಂದೇಶ ಬರೆಯಿರಿ (ಗರಿಷ್ಠ 500 ಅಕ್ಷರಗಳು)...",
    send: "ಕಳುಹಿಸಿ",
    waitCooldown: "ನಿರೀಕ್ಷಿಸಿ",
    loginToChat: "ಚಾಟ್‌ನಲ್ಲಿ ಭಾಗವಹಿಸಲು ಆಟಗಾರ ಅಥವಾ ಅಡ್ಮಿನ್ ಆಗಿ ಲಾಗಿನ್ ಆಗಿ",
    identifyAsPlayer: "ಆಟಗಾರರಾಗಿ ಪ್ರವೇಶಿಸಿ",
    selectYourPlayer: "ನಿಮ್ಮ ಆಟಗಾರ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    changePlayer: "ಆಟಗಾರರನ್ನು ಬದಲಾಯಿಸಿ",
    deleteMessage: "ಸಂದೇಶ ಅಳಿಸಿ",
    deleteConfirm: "ಅಡ್ಮಿನ್ ಆಗಿ ಈ ಸಂದೇಶವನ್ನು ಖಚಿತವಾಗಿ ಅಳಿಸಬೇಕೆ?",
    adminBadge: "ಅಡ್ಮಿನ್",
    announcements: "ಪ್ರಕಟಣೆಗಳು",
    announcementsSubtitle: "ಅಧಿಕೃತ ಟೂರ್ನಮೆಂಟ್ ಪ್ರಕಟಣೆಗಳು, ಮೈದಾನ ಮಾಹಿತಿ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ",
    noAnnouncementsYet: "No announcements yet.",
    newAnnouncement: "ಹೊಸ ಪ್ರಕಟಣೆ",
    postAnnouncement: "ಪ್ರಕಟಣೆ ಪ್ರಕಟಿಸಿ",
    announcementTitle: "ಪ್ರಕಟಣೆಯ ಶೀರ್ಷಿಕೆ",
    announcementBody: "ಪ್ರಕಟಣೆಯ ವಿವರಗಳು",
    titlePlaceholder: "ಉದಾಹರಣೆಗೆ, ಪಂದ್ಯ ವೇಳಾಪಟ್ಟಿ ಬದಲಾವಣೆ ಅಥವಾ ಕಿಟ್ ವಿತರಣೆ...",
    bodyPlaceholder: "ಸಂಪೂರ್ಣ ಪ್ರಕಟಣೆ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ (ಗರಿಷ್ಠ 1000 ಅಕ್ಷರಗಳು)...",
    pinAnnouncement: "ಪಿನ್ ಮಾಡಿ",
    unpinAnnouncement: "ಅನ್‌ಪಿನ್ ಮಾಡಿ",
    pinnedNotice: "ಪಿನ್ ಮಾಡಲಾದ ಪ್ರಕಟಣೆ",
    deleteAnnouncement: "ಪ್ರಕಟಣೆ ಅಳಿಸಿ",
    deleteAnnouncementConfirm: "ಈ ಪ್ರಕಟಣೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.",
    postedBy: "ಪ್ರಕಟಿಸಿದವರು",
    announcementPostedSuccess: "ಪ್ರಕಟಣೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ!",
    viewAllAnnouncements: "ಎಲ್ಲಾ ಪ್ರಕಟಣೆಗಳನ್ನು ನೋಡಿ",
    latestAnnouncement: "ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆ",
    noPlayersYet: "ಯಾವುದೇ ಆಟಗಾರರು ಇನ್ನೂ ಇಲ್ಲ",
  }
};
