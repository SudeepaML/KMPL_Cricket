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
  }
};
