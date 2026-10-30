export type CollegeProfile = {
  id: string;
  name: string;
  domain: string;
  city: string;
  plan: "free_trial" | "campus_pro";
  batchSize: number;
  tpoName: string;
  tpoEmail: string;
};

export type CampusThreat = {
  id: string;
  collegeId: string;
  impersonatedCompany: string;
  feeRequested: number;
  reportCount: number;
  scamType: string;
  syndicateHandle: string;
  lastReported: string;
  riskLevel: "high" | "critical";
};

export type BroadcastLog = {
  id: string;
  collegeId: string;
  title: string;
  message: string;
  sentAt: string;
  recipientCount: number;
  channels: string[];
};

const SAMPLE_COLLEGES: Record<string, CollegeProfile> = {
  "coep-pune": {
    id: "coep-pune",
    name: "COEP Technological University, Pune",
    domain: "coep.ac.in",
    city: "Pune",
    plan: "campus_pro",
    batchSize: 1250,
    tpoName: "Dr. Arvind Kulkarni",
    tpoEmail: "tpo@coep.ac.in",
  },
  "vjti-mumbai": {
    id: "vjti-mumbai",
    name: "Veermata Jijabai Technological Institute (VJTI)",
    domain: "vjti.ac.in",
    city: "Mumbai",
    plan: "campus_pro",
    batchSize: 1100,
    tpoName: "Prof. Sunita Deshmukh",
    tpoEmail: "placements@vjti.ac.in",
  },
};

const threatsStore: CampusThreat[] = [
  {
    id: "threat-01",
    collegeId: "coep-pune",
    impersonatedCompany: "Tata Consultancy Services (TCS)",
    feeRequested: 2500,
    reportCount: 4,
    scamType: "Laptop deposit fee scam",
    syndicateHandle: "hr.tcscampus@upi",
    lastReported: "10 mins ago",
    riskLevel: "critical",
  },
  {
    id: "threat-02",
    collegeId: "coep-pune",
    impersonatedCompany: "Amazon WFH",
    feeRequested: 1500,
    reportCount: 3,
    scamType: "Telegram review task fee",
    syndicateHandle: "telegram:@earn_amazon_tasks",
    lastReported: "1 hour ago",
    riskLevel: "high",
  },
  {
    id: "threat-03",
    collegeId: "vjti-mumbai",
    impersonatedCompany: "Infosys Careers",
    feeRequested: 4200,
    reportCount: 5,
    scamType: "Forged offer letter with gate pass fee",
    syndicateHandle: "+91 9876543210",
    lastReported: "2 hours ago",
    riskLevel: "critical",
  },
];

const broadcastStore: BroadcastLog[] = [];

export function getCollegeProfile(collegeId: string): CollegeProfile {
  if (!SAMPLE_COLLEGES[collegeId]) {
    SAMPLE_COLLEGES[collegeId] = {
      id: collegeId,
      name: "Engineering & Placement Cell",
      domain: "college.edu",
      city: "India",
      plan: "campus_pro",
      batchSize: 850,
      tpoName: "Placement Officer",
      tpoEmail: `tpo@${collegeId}.edu`,
    };
  }
  return SAMPLE_COLLEGES[collegeId];
}

export function setCollegePlan(collegeId: string, plan: "free_trial" | "campus_pro"): void {
  const profile = getCollegeProfile(collegeId);
  profile.plan = plan;
  SAMPLE_COLLEGES[collegeId] = profile;
}

export function getCampusThreats(collegeId: string): CampusThreat[] {
  const match = threatsStore.filter((t) => t.collegeId === collegeId);
  return match.length > 0 ? match : threatsStore;
}

export function createBroadcastWarning(input: {
  collegeId: string;
  title: string;
  message: string;
  channels?: string[];
}): BroadcastLog {
  const college = getCollegeProfile(input.collegeId);
  const log: BroadcastLog = {
    id: `bcast-${Date.now()}`,
    collegeId: input.collegeId,
    title: input.title,
    message: input.message,
    sentAt: new Date().toISOString(),
    recipientCount: college.batchSize,
    channels: input.channels ?? ["whatsapp_broadcast", "campus_portal", "email"],
  };

  broadcastStore.unshift(log);
  return log;
}

export function getBroadcastHistory(collegeId: string): BroadcastLog[] {
  return broadcastStore.filter((b) => b.collegeId === collegeId);
}
