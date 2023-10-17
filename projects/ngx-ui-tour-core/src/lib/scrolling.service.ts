import {ElementSides, isInViewport} from './is-in-viewport';
import {debounceTime, firstValueFrom, fromEvent, map, of, timeout} from 'rxjs';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {isCovered} from './is-covered';
import {ScrollUtils} from './scroll-utils';
import {OverflowUtils} from './overflow-utils';


export interface ScrollOptions {
    center: boolean;
    smoothScroll: boolean;
    scrollContainer?: string | HTMLElement;
}

@Injectable({
    providedIn: 'root'
})
export class ScrollingService {

    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);
    private readonly document = inject(DOCUMENT);
    private readonly window = this.document.defaultView;
    private scrollOptions: ScrollOptions;

    ensureVisible(htmlElement: HTMLElement, options: ScrollOptions): Promise<void> {
        this.scrollOptions = options;

        const behavior: ScrollBehavior = options.smoothScroll && this.isBrowser ? 'smooth' : 'auto';

        const userScrollContainer = this.scrollOptions.scrollContainer,
            scrollContainer = ScrollUtils.getScrollContainer(userScrollContainer) ?? document.documentElement;

        if (OverflowUtils.isHeightOverflowing(htmlElement, scrollContainer)) {
            htmlElement.scrollIntoView({
                block: 'start',
                inline: 'start',
                behavior
            });
        } else if (options.center && !('safari' in this.window)) {
            htmlElement.scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior
            });
        } else if (!isInViewport(htmlElement, ElementSides.Bottom) || isCovered(htmlElement, ElementSides.Bottom)) {
            htmlElement.scrollIntoView({
                block: 'end',
                inline: 'nearest',
                behavior
            });
        } else if (!isInViewport(htmlElement, ElementSides.Top) || isCovered(htmlElement, ElementSides.Top)) {
            htmlElement.scrollIntoView({
                block: 'start',
                inline: 'nearest',
                behavior
            });
        } else {
            return Promise.resolve();
        }

        return behavior === 'smooth' ? firstValueFrom(this.waitForScrollFinish$) : Promise.resolve();
    }

    private get waitForScrollFinish$() {
        const userScrollContainer = this.scrollOptions.scrollContainer,
            scrollContainer = ScrollUtils.getScrollContainer(userScrollContainer) ?? document;

        return fromEvent(scrollContainer, 'scroll')
            .pipe(
                timeout({
                    each: 75,
                    with: () => of(undefined)
                }),
                debounceTime(50),
                map(() => undefined)
            );
    }

}
