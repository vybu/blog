import { a } from './elements';
import { ContainerIds } from './constants';

export function about(): string {
    return `
        <div class="about">
            <img src="/images/me_cartoon.png" alt="cartoon picture of me"/>
            <p>Welcome to my personal website, I am a software engineer based in Lithuania, Vilnius.</p>
            <p>I spend most of my time
             deepening my knowledge in front end development, especially performance and  architecture of single page applications.
             From time to time I like also like to tinker with  servers and back end technologies.
            </p>
            <blockquote>
                <p> “If you can't explain it simply you don't understand it well enough.”
                 &mdash; ${a(
                     ContainerIds.Noop,
                     'https://skeptics.stackexchange.com/questions/8742/did-einstein-say-if-you-cant-explain-it-simply-you-dont-understand-it-well-en',
                     '<s>Albert Einstein</s>',
                     '_blank',
                 )}</p>
            </blockquote>
            <p>
            I have started this blog because, I believe that to truly become good at something,
            you need to be able to express your thoughts about it clearly, so others can follow
            and understand with ease. It also serves as documentation for myself on topics and problems that I have already
            explored and solved.
            </p>
            <h4 style="display: flex; justify-content: center;">* * *</h4>
            <p>
            This website is made  without any framework and is served as simple static files built with 
            ${a(ContainerIds.Noop, 'https://github.com/vybu/blog', 'custom static site generator', '_black')}.
            From the ground up it's
            progressively enhanced and can run on any browser, with or without javascript enabled. </p>
        </div>
`;
}
