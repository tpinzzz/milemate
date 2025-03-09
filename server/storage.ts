import { users, type User, type InsertUser } from "@shared/schema";
import { trips, type Trip, type InsertTrip } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTrips(userId: string): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private currentIdUsers: number;
  private currentIdTrips: number;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.currentIdUsers = 1;
    this.currentIdTrips = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIdUsers++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTrips(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(
      (trip) => trip.userId === userId,
    );
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.currentIdTrips++;
    const trip: Trip = {
      ...insertTrip,
      id,
      createdAt: new Date(),
    };
    this.trips.set(id, trip);
    return trip;
  }
}

export const storage = new MemStorage();