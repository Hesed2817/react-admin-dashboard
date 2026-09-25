import { STATUS_ACTIVE } from "../constants/statuses";

const BASE_CREATED_AT = new Date("2026-09-15T09:00:00.000Z");
const CREATED_AT_MONTHS_SPAN = 12;

function deriveUserCreatedAt(id) {
  const monthsBack = Number(id) % CREATED_AT_MONTHS_SPAN;
  const createdAt = new Date(BASE_CREATED_AT);
  createdAt.setUTCMonth(createdAt.getUTCMonth() - monthsBack);
  return createdAt.toISOString();
}

const MOCK_USERS = [
  { id: 1, name: "Leanne Graham", email: "leanne.graham@example.com", role: "Administrator", phone: "+1 (555) 210-3345" },
  { id: 2, name: "Ervin Howell", email: "ervin.howell@example.com", role: "Support Lead", phone: "+1 (555) 774-1190" },
  { id: 3, name: "Clementine Bauch", email: "clementine.bauch@example.com", role: "Support Agent", phone: "+1 (555) 662-8801" },
  { id: 4, name: "Patricia Lebsack", email: "patricia.lebsack@example.com", role: "Billing Manager", phone: "+1 (555) 431-9927" },
  { id: 5, name: "Chelsey Dietrich", email: "chelsey.dietrich@example.com", role: "Receptionist", phone: "+1 (555) 908-4472" },
  { id: 6, name: "Mrs. Dennis Schulist", email: "dennis.schulist@example.com", role: "Scheduler", phone: "+1 (555) 337-6650" },
  { id: 7, name: "Kurtis Weissnat", email: "kurtis.weissnat@example.com", role: "Technician", phone: "+1 (555) 519-2238" },
  { id: 8, name: "Nicholas Runolfsdottir V", email: "nicholas.runolfsdottir@example.com", role: "Auditor", phone: "+1 (555) 284-7716" },
  { id: 9, name: "Glenna Reichert", email: "glenna.reichert@example.com", role: "Coordinator", phone: "+1 (555) 846-3309" },
  { id: 10, name: "Clementina DuBuque", email: "clementina.dubuque@example.com", role: "Reviewer", phone: "+1 (555) 125-6643" },
];

function buildMockUsers() {
  return MOCK_USERS.map((user) => ({
    ...user,
    status: STATUS_ACTIVE,
    isFavorite: false,
    createdAt: deriveUserCreatedAt(user.id),
  }));
}

async function getUsers() {
  return buildMockUsers();
}

export { getUsers, deriveUserCreatedAt };
