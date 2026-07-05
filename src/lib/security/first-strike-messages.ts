import type { PersonaId } from "@/lib/personas";
import type { MisuseReason } from "@/lib/security/cooldown-repository";

/** Generic first-strike roasts per persona (any misuse reason). */
const FIRST_STRIKE_MESSAGES: Record<PersonaId, string[]> = {
  hitesh: [
    "Arre bhai, kya chal raha hai? Crab mentality on full volume. Cooldown lag gaya, 72 ghante. Chai pi lo, ego thoda thanda karo, phir builder wapas aana.",
    "Hanji, nice try. Par main Hitesh hoon, fool banne wala nahi. Penalty box, 72 hours. Itna time agar ek concept pe lagate, to aaj flex kar rahe hote.",
    "Waah, confidence to full tha. Direction thodi galat thi. Cooldown ON. Jao, khud ka code likho, chat tricks se senior nahi banta.",
    "To suno, tum smart ho, par aaj thoda zyada clever banne ki koshish hui. 72 ghante break. Documentation padho, drama nahi.",
    "Dekhiye, main help karne aaya hoon, use karne nahi. Cooldown lag gaya. Crab log bucket kheenchte hain, tum apna bucket build karo.",
    "Samajhna hai to samjho: shortcuts ka bill ab aaya hai. 72 hours. Work hard and take it, par honestly ab thoda ruk jao.",
    "Badiya attempt, marks for audacity. Cooldown for execution. Ek chota project banao tab tak, tab pata chalega asli fun kya hai.",
    "Main chai aur code wala hoon, free unlimited gyan ATM nahi. Penalty 72 ghante. Wapas aao jab genuinely stuck ho, hero banne ke liye nahi.",
    "Fatafat summary: tumne system ko test kiya, system ne tumhe test kiya. Tum fail hue, gracefully. Cooldown. Revise karo, phir milte hain.",
    "Google bhi kabhi kabhi khol liya karo, mujhe hack karne se pehle khud ko upgrade karo. 72 hour cooldown. See you on the other side, builder.",
    "Penalty box mein welcome. Popcorn nahi, notes. Socho kya galat tha, honest raho. Phir main full Hitesh energy dunga.",
    "Tumhe lagta hai main harsh hoon? Main caring hoon. Isliye roast. Cooldown 72h. Grow karo, phir chat karo.",
    "Crab mentality se nikalna hai to pehle khud ka success build karo. Cooldown lag gaya. Chai lo, code karo, wapas aao.",
    "Haan ji, caught. No hard feelings, bas hard cooldown. 72 ghante. Phir seedha, focused, ek clear doubt.",
    "Main 45 countries mein students dekhe hain, tum unique ho, par direction common hai jab shortcuts aate hain. Fix karo. Cooldown ON.",
  ],
  piyush: [
    "Bhai, kya scene tha? Full crab energy. Cooldown 72 hours. Trust me, ek feature ship karna isse zyada satisfying hai.",
    "Hey, tumne try kiya, maine notice kiya, system ne penalty diya. Fair game. Ab jao, bug fix karo, ego bhi fix ho jayega.",
    "Obvious flex: main production systems bana chuka hoon, tum abhi chat system test kar rahe ho. Tum lose hue. Cooldown ON.",
    "Kya bolu ab main... smart ho, par galat jagah smart. 72 ghante break. Builder ban na hai to build karo, chat mein nahi.",
    "Even Piyushi would say: bhai thoda ruk jao. Main bol raha hoon: cooldown lag gaya. Socho, ship karo, wapas aao.",
    "Trust me, I've seen this movie before. Ending same hoti hai: cooldown. 72 hours. Real dev question next time, drama nahi.",
    "Main mentor hoon, exploit karne wala bot nahi. Penalty box. Crab mentality out, builder mentality in. Jai Shree Krishna, par ab wait.",
    "Production alert fired, user got roasted. Deserved. 72h cooldown. Go touch grass, touch keyboard, touch production.",
    "Tumhe lagta hai main mean hoon? Main honest hoon. Cooldown lag gaya. Wapas aao, main full Piyush mode on kar dunga.",
    "Nice try bhai, marks for confidence. Cooldown for delivery. 72 hours. Keep working hard, par ab direction change karo.",
    "Crab bucket se nikalna hai to PR raise karo life mein, chat mein nahi. Cooldown ON. Milte hain jab serious ho.",
    "Bhai, chill. Literally. 72 hour penalty. Socho kya seekhna chahte ho, meme spam nahi.",
    "Main JavaScript se itna pyaar karta hoon, tum bhi kisi skill se karo. Cooldown lag gaya. Wapas aao jab ready ho.",
    "Teachyst scale kiya hai maine, tum abhi scale kar rahe ho wrong moves. Fix karo. 72 ghante.",
    "Penalty box VIP entry: achieved. Exit: 72 hours + better behavior. Go build something small, dopamine real milega.",
  ],
};

/** Predefined roast when the model flags first-time misuse (reason ignored for variety). */
export function getFirstStrikeRoast(
  personaId: PersonaId,
  _reason: MisuseReason,
): string {
  const pool = FIRST_STRIKE_MESSAGES[personaId];
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}
