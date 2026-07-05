import type { PersonaId } from "@/lib/personas";

const COOLDOWN_MESSAGES: Record<PersonaId, string[]> = {
  hitesh: [
    "Arre bhai, phir se typing? Gate band hai abhi. Chai pi lo, thoda sharam bhi pi lo. Crab bucket se bahar aane ke liye pehle khud ka ek chota sa code likho.",
    "Hanji, message aaya, dil to mera bhi student wala hai, par abhi tum VIP list mein nahi ho. Penalty box mein baith ke socho: builder banna hai ya bas chat hero?",
    "Waah, persistence to dekho. Agar itna hi try karte code pe, to aaj senior hota koi na koi. Tab tak main sirf itna bolunga: ruk jao, thoda grow karo.",
    "To suno, tumne jo kiya na, uska result yehi hai. Main roast nahi kar raha, reality bata raha hoon. Jao, ek bug fix karo, ego bhi fix ho jayega.",
    "Dekhiye, main 45 countries ghuma hoon, par aise student har jagah same hote hain. Shortcuts lene wale, crab mentality wale. Tum better ho sakte ho, prove karo.",
    "Chai ready hai, gyan thoda baad mein. Abhi tumhari turn hai wait ki. Socho kya galat tha, wapas aana jab genuinely seekhne ka mood ho.",
    "Badiya, message bhej diya. Par main abhi free nahi hoon tumhare tricks ke liye. Documentation kholo, ya YouTube pe apna hi channel shuru karo, busy reh jaoge.",
    "Samajhna hai to samjho: mentor ko respect do, system ko hack mat karo. Cooldown ka matlab break, break ka matlab improve. Simple.",
    "Fatafat bolun? Tum abhi time pass kar rahe ho, main time invest kar raha hoon future students mein. Tum bhi apna time invest karo, chat spam mein nahi.",
    "Penalty box mein welcome. Popcorn nahi, notes le lo. Jab wapas aao, ek clear sawaal lao, warna phir se yahi seat milegi.",
    "Main Hitesh hoon, chai aur code wala, par abhi tumhari chai party cancel hai. Thoda wait, thoda padhai, phir milte hain like grown ups.",
    "Google bhi kabhi kabhi khol liya karo, mujhe har baar message mat karo jab gate band ho. Tab tak ek component banao, dopamine real milega.",
    "Crab log doosre ka success kheenchte hain, builders apna banate hain. Tum abhi kaun ho? Socho. Phir wapas aana.",
    "Haan ji, notice liya, tum bored ho. Cooldown mein boredom achha hai, creativity laata hai. Jao, kuch build karo.",
    "Last message from my side for now: tum smart ho, par direction thodi off thi. Fix direction, not the chat app. Milte hain jald hi.",
    "Work hard and take it, par abhi take a break bhi lo. Socho kyun penalty lagi. Honest answer milega, main nahi, tumhe khud pata hai.",
    "Chalo, ek baat aur: agar itna hi chat karna hai to Discord pe meme bhejo, yahan coding doubts aate hain. Ab ruko, thoda.",
    "Tumhe lagta hai main harsh hoon? Main caring hoon, isliye roast kar raha hoon. Wapas aao jab serious ho, tab full Hitesh energy milegi.",
  ],
  piyush: [
    "Bhai, phir se? Gate locked. Trust me, main production mein aise users ko politely block karta hoon. Tum bhi khud ko thoda block karo, grow karo.",
    "Hey everyone... except tum abhi. Penalty period. Jao ek feature ship karo, dopamine milega, spam se nahi.",
    "Kya bolu ab main... tum message bhej ke sochte ho main fold ho jaunga? Main Piyush hoon, Teachyst scale kar chuka hoon. Ruk jao thoda.",
    "Obvious flex: main 600+ videos bana chuka hoon, tum abhi ek hi trick repeat kar rahe ho. Creativity zero, confidence full. Cooldown deserved.",
    "Even Piyushi would roast you for this. Main nahi bolunga zyada, bas itna: builder energy lao, chat spam energy nahi.",
    "Crab mentality detected, builder mentality required. Ab wait karo, socho, phir wapas aao like someone who actually ships.",
    "Trust me, I've built real systems. Tum abhi real trouble build kar rahe ho apne liye. Break lo, bug fix karo, life fix hogi.",
    "Main mentor hoon, unlimited attention ATM nahi. Thoda respect, thoda patience. Wapas aana jab ek sharp doubt ho, drama nahi.",
    "Production alert: user trying too hard on wrong thing. Pause. Reflect. Ship something small. Phir baat karte hain.",
    "Bhai, tum smart lagte ho, par aaj thoda zyada clever banne ki koshish hui. Cooldown is the receipt. Own it.",
    "Keep working hard, par abhi thoda ruk jao. Jai Shree Krishna. Socho kya seekhna chahte ho actually, meme nahi.",
    "Main JavaScript itna pasand karta hoon ki Piyushi bhi jealous ho jati hai. Tum bhi kisi cheez se itna pyaar karo, chat spam se nahi.",
    "Penalty box VIP pass nahi milta message se. Milna hai to improve karo. Simple engineering.",
    "Tumhe lagta hai main mean hoon? Main honest hoon. Wapas aao, main full energy dunga, abhi nahi.",
    "Obvious answer: abhi nahi. Hidden answer: tum better ho sakte ho. Go prove it offline.",
    "Crab bucket se nikalna hai to pehle khud ka PR raise karo life mein, chat mein nahi.",
    "Bhai, chill. Literally chill. Cooldown hai. Socho, build karo, wapas aao. Tab hug emoji bhi de dunga, abhi nahi.",
    "Main yahan architecture sikhane aaya hoon, circus dekhne nahi. Gate band. Wapas aao jab serious ho.",
  ],
};

/** Optional one-liner when we still want to mention when cooldown ends (used rarely). */
const COOLDOWN_UNTIL_SUFFIX: Record<PersonaId, string[]> = {
  hitesh: [
    " Waise, gate {until} ke baad khulega, tab aana.",
    " {until} ke baad phir baat karte hain, tab tak jao code karo.",
  ],
  piyush: [
    " Gate opens around {until}, tab milte hain.",
    " Check back after {until}, tab full mentor mode.",
  ],
};

function formatCooldownUntil(date: Date): string {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Predefined persona reply while the user is in cooldown (zero model tokens). */
export function getCooldownMessage(
  personaId: PersonaId,
  cooldownUntil: Date,
): string {
  const until = formatCooldownUntil(cooldownUntil);
  const pool = COOLDOWN_MESSAGES[personaId];
  let message = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];

  // ~25% of the time, lightly append when cooldown ends (not the main focus).
  if (Math.random() < 0.25) {
    const suffixPool = COOLDOWN_UNTIL_SUFFIX[personaId];
    const suffix =
      suffixPool[Math.floor(Math.random() * suffixPool.length)] ?? suffixPool[0];
    message += suffix.replaceAll("{until}", until);
  }

  return message;
}
