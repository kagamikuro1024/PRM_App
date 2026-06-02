import { Contact } from "@prisma/client";
import { getNextOccasionDate } from "@/lib/date-utils";

/**
 * Compute relationship health score (0-100) based on:
 * - 60%: Time since last contact vs check-in frequency
 *   - On time: 60 points
 *   - Overdue 1.5x: 30 points
 *   - Overdue 2x+: 0 points
 * - 20%: Relationship strength (strength * 4)
 * - 20%: Upcoming occasion within 30 days (bonus)
 */
export function computeHealthScore(contact: Contact & {
  occasions?: Array<{ date: Date; recurring?: boolean }>;
}): number {
  const { lastContactAt, checkInFrequency, strength, occasions = [] } = contact;

  // Base score from strength (1-5 -> 4-20 points)
  let score = (strength || 1) * 4;

  // Time-based component (60 points max)
  if (lastContactAt && checkInFrequency) {
    const daysSinceLastContact = Math.floor(
      (new Date().getTime() - new Date(lastContactAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const overdueFactor = daysSinceLastContact / checkInFrequency;

    if (overdueFactor <= 1) {
      // On time or recent
      score += 60;
    } else if (overdueFactor <= 1.5) {
      // Slightly overdue
      score += 30;
    } else {
      // Very overdue - no time bonus
      score += 0;
    }
  } else {
    // No last contact recorded - give partial score
    score += 30;
  }

  // Occasion bonus (20 points max)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const hasUpcomingOccasion = occasions.some((occasion) => {
    const occasionDate = getNextOccasionDate(
      new Date(occasion.date),
      Boolean(occasion.recurring)
    );
    return occasionDate >= new Date() && occasionDate <= thirtyDaysFromNow;
  });

  if (hasUpcomingOccasion) {
    score += 20;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}
