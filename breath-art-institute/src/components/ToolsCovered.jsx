import { motion } from 'framer-motion';

const tools = [
    {
        id: 'yoast',
        name: 'yoast',
        bg: 'bg-[#d8f8e8]',
        content: (
            <div className="flex items-center justify-center font-bold text-3xl tracking-tight">
                <span className="text-[#a4286a] italic mr-1">y</span><span className="text-[#81b214]">yoast</span>
            </div>
        )
    },
    {
        id: 'ahrefs',
        name: 'ahrefs',
        bg: 'bg-[#e0f7fa]',
        content: (
            <div className="flex items-center justify-center font-bold text-3xl tracking-tight">
                <span className="text-[#f7931e]">a</span><span className="text-[#0052cc]">hrefs</span>
            </div>
        )
    },
    {
        id: 'surfer',
        name: 'surfer',
        bg: 'bg-[#3b1a54]',
        content: (
            <div className="flex items-center justify-center font-bold text-xl tracking-tight text-white gap-2">
                <div className="w-6 h-6 border-2 border-[#ff6666] rounded flex flex-col items-center justify-end p-0.5">
                    <div className="flex gap-0.5 items-end h-full">
                        <div className="w-1 h-2 bg-white"></div>
                        <div className="w-1 h-3 bg-white"></div>
                        <div className="w-1 h-4 bg-[#ff6666]"></div>
                    </div>
                </div>
                SURFER
            </div>
        )
    },
    {
        id: 'keywordio',
        name: 'keyword.io',
        bg: 'bg-[#1b6267]',
        content: (
            <div className="flex items-center justify-center font-bold text-3xl tracking-tighter text-white">
                <span className="">keyword</span>
                <div className="bg-white text-[#1b6267] rounded-full w-8 h-8 flex items-center justify-center ml-1 text-base">io</div>
            </div>
        )
    },
    {
        id: 'bing',
        name: 'bing',
        bg: 'bg-[#e5d5ff]',
        content: (
            <div className="flex flex-col items-center justify-center font-bold tracking-tight text-[#008080]">
                <div className="flex justify-center items-center text-3xl mb-1">
                    <svg className="w-6 h-6 mr-1 fill-current" viewBox="0 0 24 24"><path d="M5.4 0L5.4 24 16.6 15.6 16.6 9.6 9.4 14.4 9.4 4.8z" /></svg>
                    <span>Bing</span>
                </div>
                <div className="text-sm font-normal">webmaster</div>
            </div>
        )
    },
    {
        id: 'mailchimp',
        name: 'mailchimp',
        bg: 'bg-[#aadeff]',
        content: (
            <div className="flex items-center justify-center font-bold text-2xl tracking-tight text-black">
                <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-1.42s-1-.3-1.63-.5c-2-.66-3.87-2.73-3.87-2.73 1.05-.1 1.94 1.3 2.15 1.7.35.63 1.15.82 1.85.5.06-.03.13-.06.2-.1-.08-.6.18-1.2.66-1.57-2.34-.14-4.82-1.12-4.82-5.1 0-1.12.38-2.04 1-2.76-.1-.26-.43-1.3.1-2.72 0 0 .83-.26 2.7 1.02.8-.23 1.64-.34 2.48-.34.84 0 1.68.1 2.48.34 1.87-1.28 2.7-1.02 2.7-1.02.53 1.42.2 2.46.1 2.72.64.72 1 1.64 1 2.76 0 3.98-2.5 4.96-4.84 5.1.48.42.9 1.26.9 2.5v3.7c0 .12.02.24.06.35C19.78 18.06 22 15.28 22 12c0-5.52-4.48-10-10-10zM10 15v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V15h1zM14 15v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V15h1z" /></svg> mailchimp
            </div>
        )
    },
    {
        id: 'moz',
        name: 'moz',
        bg: 'bg-[#e5d5ff]',
        content: (
            <div className="flex items-center justify-center font-black text-5xl tracking-tighter text-[#33b6d8]">
                MOZ
            </div>
        )
    },
    {
        id: 'ubersuggest',
        name: 'ubersuggest',
        bg: 'bg-[#f15c32]',
        content: (
            <div className="flex items-center justify-center font-bold text-xl tracking-tight text-white">
                Ubersuggest
            </div>
        )
    },
    {
        id: 'keywordplanner',
        name: 'google keyword planner',
        bg: 'bg-[#fdf0d5]',
        content: (
            <div className="flex flex-col items-center justify-center font-bold text-2xl tracking-tighter text-slate-800 leading-none">
                <div className="flex">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-normal mt-1">Keyword Planner</div>
            </div>
        )
    },
    {
        id: 'searchconsole',
        name: 'google search console',
        bg: 'bg-[#d8f8e8]',
        content: (
            <div className="flex items-center justify-center font-bold text-2xl tracking-tighter text-slate-500 leading-none gap-2">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div className="flex flex-col items-start leading-tight">
                    <div className="text-lg text-slate-700">Google</div>
                    <div className="text-xs font-medium tracking-normal text-slate-400">Search Console</div>
                </div>
            </div>
        )
    }
];

const ToolsCovered = () => {
    return (
        <section id="tools" className="py-20 lg:py-28 bg-white relative overflow-hidden theme-light-section">
            {/* Background decorative glow - subtle for light theme */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-0"></div>

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                {/* Header text */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-5xl font-heading font-black text-[#2f2b5a] tracking-tight mb-6">
                        What're The <span className="text-accent-cyan">Digital</span> Marketing Tools We Cover?
                    </h2>
                    <p className="text-slate-700 font-medium max-w-4xl mx-auto text-sm md:text-base leading-relaxed">
                        While providing the best digital marketing course offline and online, BreathArt offers a diverse set of tools to equip you with essential digital marketing skills
                    </p>
                </div>

                {/* Grid of tools */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`${tool.bg} rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/5 flex items-center justify-center p-6 h-32 md:h-40 xl:h-44 group`}
                        >
                            <div className="group-hover:scale-110 transition-transform duration-500">
                                {tool.content}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ToolsCovered;
