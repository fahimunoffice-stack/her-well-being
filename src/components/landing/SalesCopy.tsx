 import { Button } from "@/components/ui/button";
 import { useNavigate } from "react-router-dom";
 
 export const SalesCopy = () => {
   const navigate = useNavigate();
 
   return (
    <section className="py-8 md:py-16 bg-background">
       <div className="container mx-auto px-4 max-w-4xl">
        <div className="prose prose-base md:prose-lg mx-auto text-foreground space-y-5 md:space-y-6">
           {/* First CTA */}
          <div className="text-center my-6 md:my-8">
             <Button
               size="lg"
               onClick={() => navigate("/order")}
              className="w-full sm:w-auto text-base md:text-lg px-6 sm:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all"
             >
               ই-বুকটি অর্ডার করতে চাই
             </Button>
           </div>
 
           <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6">
             যদি আপনি জিজ্ঞেস করেন কেন আপনি ই-বুকটি কিনবেন
           </h2>
 
          <p className="text-base md:text-lg leading-relaxed">
             তাহলে আমি আপনাকে উল্টো জিজ্ঞেস করতে চাই কেন আপনি ই-বুকটি কিনবেন না?
           </p>
 
          <p className="text-base md:text-lg leading-relaxed">
             আপনি কি নিজের শরীরের পরিবর্তন গুলো ঠিকভাবে বুঝতে পারেন? আপনার শরীরের সিগন্যাল গুলো ধরতে পারেন?
           </p>
 
          <p className="text-base md:text-lg leading-relaxed font-semibold text-primary">
             যদি আপনার উত্তর হয় - না, তাহলে এই ই-বুকটি আপনার জন্য পড়া ভয়ংকর রকম জরুরী
           </p>
 
          <p className="text-base md:text-lg leading-relaxed">
             এই ই-বুকে এমন সব এডভান্স লেভেলের ইনফরমেশন শেয়ার করা হয়েছে যেগুলো আপনি আর কোথাও পাবেন নাহ। এই ই-বুকে লেখা প্রতিটি ইনফরমেশন স্পেশালিস্ট ডক্টর দিয়ে রিভিউ করা এবং অনেক গুলো টপিক ইন্টারন্যাশনাল ডক্টর দ্বারা রিভিউ করা।
           </p>
 
          <p className="text-base md:text-lg leading-relaxed">
             এই ই-বুকটিতে গাইনোকোলজির এমন এমন বিষয় নিয়ে বলা হয়েছে এবং এত্তটা সহজভাবে বুঝানো হয়েছে যে আপনি এগুলো না পড়লে বা না জানলে এই না জানাটা যে আপনার লাইফে কতটা ক্ষতিকর ইমপ্যাক্ট ফেলতে পারে সেটা আপনি এখন কল্পনাও করতে পারবেন নাহ।
           </p>
 
          <p className="text-base md:text-lg leading-relaxed italic text-accent">
             এত্তগুলো পাওয়ারফুল ইনফরমেশন এবং এত্তগুলো এডভান্স লেভেলের নলেজ, এত্ত সহজ ভাষায়, এরকম সব একসাথে, আপনি অন্য কোথাও পাবেন না, ইল্লা মা শা আল্লাহ
           </p>
 
          <p className="text-base md:text-lg leading-relaxed">
             যদি আপনি অনেক টাকা খরচ করে কোনো স্পেশালিস্ট ডক্টরকে দেখান তবে সেই ডক্টর হয়তো আপনাকে কোনো একটা নির্দিষ্ট টপিকের উপরে বলবে, এভাবে এত্তগুলো ইম্পরট্যান্ট টপিক এরকম ভাবে আপনাকে কেউ বলবে না।
           </p>
 
           <h3 className="text-xl md:text-2xl font-bold mt-10 mb-4 text-foreground">
             আপনি এই ই-বুকটি পড়ে জানতে পারবেন -
           </h3>
 
          <ul className="list-decimal list-inside space-y-2 text-base md:text-lg">
             <li>গাইনোকোলজির কোন বিষয়গুলো স্বাভাবিক</li>
             <li>কোন বিষয়গুলো অস্বাভাবিক</li>
             <li>কখন ঘরোয়া পদ্ধতিতে সমস্যা সমাধান করা যাবে</li>
             <li>ঘরোয়া উপায় গুলো কি কি</li>
             <li>কখন ডাক্তারের কাছে যেতে হবে এবং কখন চিকিৎসা নিতে হবে</li>
           </ul>
 
           {/* Fourth CTA */}
          <div className="text-center my-6 md:my-8">
             <Button
               size="lg"
               onClick={() => navigate("/order")}
              className="w-full sm:w-auto text-base md:text-lg px-6 sm:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all"
             >
               ই-বুকটি অর্ডার করতে চাই
             </Button>
           </div>
 
          <p className="text-base md:text-lg leading-relaxed">
             নিচের দিকে সূচিপত্র দেয়া আছে যাতে আপনি বিস্তারিত ধারণা পেতে পারেন যে ই-বুকটি তে কোন কোন টপিক নিয়ে আলোচনা করা হয়েছে তবে টপিক গুলোর ভিতরে যে কত্তটা এডভান্স লেভেলের ইনফরমেশন শেয়ার করা হয়েছে আর এগুলো যে কত্তটা valuable সেটা আপনি ই-বুকটা না পড়লে শুধু মাত্র সূচিপত্র দেখে পুরোপুরি বুঝতে পারবেন নাহ।
           </p>
 
          <div className="bg-secondary p-4 md:p-6 rounded-lg my-6 md:my-8">
            <p className="text-base md:text-lg leading-relaxed font-bold text-primary">
                Most important thing, ই-বুকটিতে যে লেভেল এর ইনফরমেশন শেয়ার করা হয়েছে এবং যেভাবে সহজ করে লেখা হয়েছে তার against এ যদি এর প্রাইস নির্ধারণ করা হয় তাহলে এটার মূল্য হবে অমূল্য। এটার প্রকৃত মূল্য টাকা দিয়ে নির্ধারণ করা যাবে নাহ।
             </p>
           </div>
 
          <p className="text-base md:text-lg leading-relaxed">
             কিন্তু যেহেতু একটা প্রাইস রাখতেই হবে তাই just নাম মাত্র মূল্যে মাত্র <span className="font-bold text-primary text-2xl">২৮০ টাকা</span> এর প্রাইস নির্ধারন করা হয়েছে।
           </p>
 
          <p className="text-base md:text-lg leading-relaxed">
             আর এই প্রাইস টাকে আপনি খরচ হিসেবে না দেখে investment হিসেবে দেখুন। ইন শা আল্লাহ, এটা যে আপনার লাইফের কত লাখ লাখ টাকা বাচিয়ে দিতে পারে এবং আপনাকে কি পরিমাণ শারীরিক এবং মানসিক যন্ত্রণা থেকে মুক্তি দিতে পারে সেটা হয়তো আপনি এখন কল্পনাও করতে পারবেন নাহ।
           </p>
 
          <div className="bg-accent/10 border-2 border-accent p-4 md:p-6 rounded-lg my-6 md:my-8">
            <p className="text-base md:text-lg leading-relaxed font-semibold">
               আর সবচেয়ে interesting বিষয় হচ্ছে, পুরো ই-বুকটি পড়ার পরে যদি আপনার মনে হয় যে ই-বুকটি তে যথেষ্ট ভ্যালু দেয়া হয়নি বা ই-বুকটি কিনে আপনার লাভ হয়নি বা ই-বুকটির দাম বেশি রাখা হয়েছে তাহলে আপনি আমাদের সাথে যোগাযোগ করবেন, আমরা আপনাকে সাথে সাথে আপনার পুরো টাকা তো ফেরত দিবোই বরং আরো বাড়িয়ে দিবো। আপনি ২৮০ টাকা দিয়ে ই-বুকটি কিনবেন কিন্তু আপনার কাছে valuable মনে না হলে আমরা আপনাকে সাথে সাথে ৩০০ টাকা ফেরত দিবো এবং এটা 100% সত্যি।
             </p>
           </div>
 
           <h3 className="text-xl md:text-2xl font-bold mt-10 mb-4 text-foreground">
             ই-বুকটি কাদের জন্য?
           </h3>
 
          <ol className="list-decimal list-inside space-y-2 text-base md:text-lg">
             <li>যাদের এখনো বয়ঃসন্ধিকাল শুরু হয়নি, কিন্তু খুব শীঘ্রই শুরু হবে</li>
             <li>যাদের বয়ঃসন্ধিকাল চলতেছে</li>
             <li>যারা বিয়ের প্রিপারেশন নিচ্ছেন বা খুব শীঘ্রই বিয়ে হবে</li>
             <li>যারা রিসেন্টলি বিয়ে করেছেন</li>
             <li>যারা বাচ্চা নেয়ার পরিকল্পনা করতেছেন বা খুব শীঘ্রই বাচ্চা নিবেন</li>
             <li>যারা বাচ্চা নেয়ার চেষ্টা করতেছেন কিন্তু কোনোভাবেই কনসিভ হচ্ছে না কিংবা কনসিভ হলেও গর্ভপাত হয়ে যাচ্ছে</li>
             <li>যারা অলরেডি গর্ভবতী</li>
             <li>যারা রিসেন্টলি বা সম্প্রতি বাচ্চার মা হয়েছেন</li>
             <li>যদি আপনার মাসিকের সমস্যা থাকে, মাসিক অনিয়মিত হয়, মাসিকে ব্যাথা হয়, যৌনাঙ্গে চুলকানি থাকে অথবা স্রাবের সমস্যা থাকে</li>
             <li>যদি আপনি যোনিপথের রোগ প্রতিরোধ সম্পর্কে জানতে চান, যোনিপথ সুস্থ রাখার টিপস জানতে চান, জরায়ু মুখের ক্যান্সার নিয়ে জানতে চান, সতীচ্ছদ পর্দা এবং কুমারীত্ব পরীক্ষা নিয়ে জানতে চান</li>
             <li>পুরুষ এবং নারী উভয়ের যৌন সাস্থ্য বিষয়ক ভুল ধারণা সম্পর্কে জানতে চান</li>
             <li>যাদের ঘরে এই সকল ক্যাটাগরির কোনো নারী সদস্য আছে তারাও এই সুন্দর ই-বুকটি কিনে আপনার পরিবারের সদস্যকে উপহার দিতে পারেন</li>
           </ol>
 
           {/* Final CTA in sales copy */}
          <div className="text-center my-8 md:my-12">
             <Button
               size="lg"
               onClick={() => navigate("/order")}
              className="w-full sm:w-auto text-base md:text-lg px-6 sm:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all"
             >
               ই-বুকটি অর্ডার করতে চাই
             </Button>
           </div>
         </div>
       </div>
     </section>
   );
 };