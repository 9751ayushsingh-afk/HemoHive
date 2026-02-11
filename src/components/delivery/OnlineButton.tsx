import React from 'react';
import styles from './OnlineButton.module.css';

interface OnlineButtonProps {
    isOnline: boolean;
    toggleOnline: () => void;
}

const OnlineButton: React.FC<OnlineButtonProps> = ({ isOnline, toggleOnline }) => {
    return (
        <div className={styles.container}>
            <label htmlFor="button" className={styles.area}>
                {/* 
                  Note: The checked state is inverted in the CSS logic. 
                  In the original code: 
                  - input:not(:checked) triggers the "open" / "active" animations (sparks, gears, etc).
                  - This implies "unchecked" is the "ON" state visually for the "Start" button logic?
                  
                  Let's re-read the CSS:
                  .area input:not(:checked) ~ .button .wrap { animation: cover-open ... }
                  "cover-open" reveals the gears. 
                  So "Not Checked" = "Gears Visible" = "Active"?
                  
                  The user's code had `defaultChecked`.
                  If defaultChecked (checked), then `input:not(:checked)` is false. 
                  So wrapper is closed?
                  
                  If we want "Online" to be the "Active/Gears" state:
                  Rule: .area input:not(:checked) ~ .button .gears { opacity: 1; }
                  So "Not Checked" means "Gears Visible" (Online).
                  
                  So:
                  Checkbox CHECKED = OFFLINE (Cover Closed)
                  Checkbox UNCHECKED = ONLINE (Cover Open, Gears, Sparks)
                  
                  Wait, that's counter-intuitive for a checkbox.
                  Usually Checked = On.
                  
                  But the CSS says: `input:not(:checked) ~ .button .gears { opacity: 1; }`
                  This means when UNCHECKED, the gears are visible.
                  
                  So `isOnline` (true) should correspond to `checked={false}`?
                  Let's try that mapping.
                  
                  If isOnline=true -> checked=false (Gears visible)
                  If isOnline=false -> checked=true (Cover closed, "GET STARTED" visible?)
                */}
                <input
                    type="checkbox"
                    id="button"
                    checked={!isOnline}
                    onChange={toggleOnline}
                    className={styles.input}
                />
                <div className={styles.button}>
                    <div className={styles.wave} />
                    <div className={styles.wrap}>
                        <div className={styles.reflex} />
                        <div className={styles.content}>
                            {/* State 1: Visible when CHECKED (Offline) */}
                            <span className={`${styles.text} ${styles.state1}`}>
                                {/* "GO ONLINE" - 9 chars */}
                                <span style={{ '--i': 1 } as React.CSSProperties} data-label="G">G</span>
                                <span style={{ '--i': 2 } as React.CSSProperties} data-label="O">O</span>
                                <span style={{ '--i': 3 } as React.CSSProperties} data-label=" "> </span>
                                <span style={{ '--i': 4 } as React.CSSProperties} data-label="O">O</span>
                                <span style={{ '--i': 5 } as React.CSSProperties} data-label="N">N</span>
                                <span style={{ '--i': 6 } as React.CSSProperties} data-label="L">L</span>
                                <span style={{ '--i': 7 } as React.CSSProperties} data-label="I">I</span>
                                <span style={{ '--i': 8 } as React.CSSProperties} data-label="N">N</span>
                                <span style={{ '--i': 9 } as React.CSSProperties} data-label="E">E</span>
                            </span>
                            {/* State 2: Visible when UNCHECKED (Online/Active) */}
                            <span className={`${styles.text} ${styles.state2}`}>
                                <span style={{ '--i': 1 } as React.CSSProperties} data-label="O">O</span>
                                <span style={{ '--i': 2 } as React.CSSProperties} data-label="N">N</span>
                                <span style={{ '--i': 3 } as React.CSSProperties} data-label="L">L</span>
                                <span style={{ '--i': 4 } as React.CSSProperties} data-label="I">I</span>
                                <span style={{ '--i': 5 } as React.CSSProperties} data-label="N">N</span>
                                <span style={{ '--i': 6 } as React.CSSProperties} data-label="E">E</span>
                                <span style={{ '--i': 7 } as React.CSSProperties} data-label="!">!</span>
                                <span style={{ '--i': 8 } as React.CSSProperties} data-label="!">!</span>
                            </span>
                        </div>
                    </div>
                    <div className={styles.gears}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 635 523">
                            <defs>
                                <filter id="filter">
                                    <feGaussianBlur result="blur" stdDeviation={5} in="SourceGraphic" />
                                    <feColorMatrix result="goo" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" type="matrix" in="blur" />
                                    <feBlend in2="goo" in="SourceGraphic" />
                                </filter>
                            </defs>
                            <g filter="url(#filter)">
                                <path className={`${styles.large} ${styles.shadow}`} d="M635 192V171L606 167C605 157 603 148 600 139L625 125L617 106L589 113C584 105 579 97 573 89L592 66L577 51L554 68C547 62 539 57 530 52L537 24L518 16L504 41C495 38 486 36 476 35L472 8H451L447 37C437 38 428 40 419 43L405 18L386 26L393 54C385 59 377 64 369 70L346 53L331 66L348 89C342 96 337 104 332 113L304 106L296 125L321 139C318 148 316 157 315 167L286 171V192L315 196C316 206 318 215 321 224L296 238L304 257L332 250C337 258 342 266 348 274L331 297L346 312L369 295C376 301 384 306 393 311L386 339L405 347L419 322C428 325 437 327 447 328L451 357H472L476 328C486 327 495 325 504 322L518 347L537 339L530 311C538 306 546 301 554 295L577 312L592 297L575 274C581 267 586 259 591 250L619 257L627 238L602 224C605 215 607 206 608 196L635 192ZM461 292C400 292 351 243 351 182C351 121 401 72 461 72C521 72 571 121 571 182C571 243 522 292 461 292Z" />
                                <path className={`${styles.medium} ${styles.shadow}`} d="M392 398V377L364 373C363 363 360 354 357 345L380 328L369 310L342 321C336 313 329 307 322 301L333 275L315 264L298 287C289 283 280 281 270 280L266 252H245L241 280C231 281 222 284 213 287L196 264L178 275L189 301C181 307 175 314 169 321L143 310L132 328L155 345C151 354 149 363 148 373L120 377V398L148 402C149 412 152 421 155 430L132 447L143 465L169 454C175 462 182 468 189 474L178 500L196 511L213 488C222 492 231 494 241 495L245 523H266L270 495C280 494 289 491 298 488L315 511L333 500L322 474C330 468 336 461 342 454L368 465L379 447L356 430C360 421 362 412 363 402L392 398ZM255 461C214 461 181 428 181 387C181 346 214 313 255 313C296 313 329 346 329 387C328 428 295 461 255 461Z" />
                                <path className={`${styles.small} ${styles.shadow}`} d="M200 244V223L171 219C169 209 165 201 160 193L178 170L163 155L140 173C132 168 123 164 114 162L110 133H90L86 162C76 164 68 168 60 173L37 155L22 170L40 193C35 201 31 210 29 219L0 223V244L29 248C31 258 35 266 40 274L22 297L37 312L60 294C68 299 77 303 86 305L90 334H111L115 305C125 303 133 299 141 294L164 312L179 297L161 274C166 266 170 257 172 248L200 244ZM100 270C80 270 63 253 63 233C63 213 80 196 100 196C120 196 137 213 137 233C137 253 121 270 100 270Z" />
                                <path className={styles.large} d="M635 184V163L606 159C605 149 603 140 600 131L625 117L617 98L589 105C584 97 579 89 573 81L592 58L577 43L554 60C547 54 539 49 530 44L537 16L518 8L504 33C495 30 486 28 476 27L472 0H451L447 29C437 30 428 32 419 35L405 9L386 17L393 45C385 50 377 55 369 61L346 44L331 58L348 81C342 88 337 96 332 105L304 98L296 117L321 131C318 140 316 149 315 159L286 163V184L315 188C316 198 318 207 321 216L296 230L304 249L332 242C337 250 342 258 348 266L331 289L346 304L369 287C376 293 384 298 393 303L386 331L405 339L419 314C428 317 437 319 447 320L451 349H472L476 320C486 319 495 317 504 314L518 339L537 331L530 303C538 298 546 293 554 287L577 304L592 289L575 266C581 259 586 251 591 242L619 249L627 230L602 216C605 207 607 198 608 188L635 184ZM461 284C400 284 351 235 351 174C351 113 401 64 461 64C521 64 571 113 571 174C571 235 522 284 461 284Z" />
                                <path className={styles.medium} d="M392 390V369L364 365C363 355 360 346 357 337L380 320L369 302L342 313C336 305 329 299 322 293L333 267L315 256L298 279C289 275 280 273 270 272L266 244H245L241 272C231 273 222 276 213 279L196 256L178 267L189 293C181 299 175 306 169 313L143 302L132 320L155 337C151 346 149 355 148 365L120 369V390L148 394C149 404 152 413 155 422L132 439L143 457L169 446C175 454 182 460 189 466L178 492L196 503L213 480C222 484 231 486 241 487L245 515H266L270 487C280 486 289 483 298 480L315 503L333 492L322 466C330 460 336 453 342 446L368 457L379 439L356 422C360 413 362 404 363 394L392 390ZM255 453C214 453 181 420 181 379C181 338 214 305 255 305C296 305 329 338 329 379C328 420 295 453 255 453Z" />
                                <path className={styles.small} d="M200 236V215L171 211C169 201 165 193 160 185L178 162L163 147L140 165C132 160 123 156 114 154L110 125H90L86 154C76 156 68 160 60 165L37 147L22 162L40 185C35 193 31 202 29 211L0 215V236L29 240C31 250 35 258 40 266L22 289L37 304L60 286C68 291 77 295 86 297L90 326H111L115 297C125 295 133 291 141 286L164 304L179 289L161 266C166 258 170 249 172 240L200 236ZM100 262C80 262 63 245 63 225C63 205 80 188 100 188C120 188 137 205 137 225C137 245 121 262 100 262Z" />
                            </g>
                        </svg>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 478 224" className={styles.sparks}>
                        <path strokeLinecap="round" d="M172.675 130.318C176.079 94.8544 183.101 52.6838 262.101 32.6837" style={{ '--i': 1 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M286.569 127.661C299.204 94.3501 317.096 55.5231 398.574 57.0604" style={{ '--i': 4 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M335.954 194.26C370.153 182.301 412.468 170.335 474.474 222.038" style={{ '--i': 6 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M265.974 116.351C261.897 79.6629 253.871 36.3728 169.162 24.4022" style={{ '--i': 10 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M131.475 153.296C107.914 126.572 77.4904 96.5377 1.77821 126.682" style={{ '--i': 3 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M153.453 170.383C161.298 135.631 167.803 93.3778 99.0048 49.6985" style={{ '--i': 5 } as React.CSSProperties} />
                        <path strokeLinecap="round" d="M309.315 154.41C341.202 155.086 380.493 154.234 434.104 111.701" style={{ '--i': 12 } as React.CSSProperties} />
                        <path d="M109 193C54.6 140.2 66.3333 99 79 85" style={{ '--i': 7 } as React.CSSProperties} />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 401 68" height={68} width={401} className={styles.path}>
                        <path strokeOpacity="0.2" strokeLinecap="round" d="M313.89 11.6484C322.652 28.147 374.652 31.5 397.652 0.999998" />
                        <path strokeOpacity="0.3" strokeLinecap="round" d="M290.652 17.0773C294.773 34.8416 359.652 50.5 387.152 24" />
                        <path strokeOpacity="0.5" strokeLinecap="round" d="M265.152 17.0773C274.152 38 323.652 68 362.152 42" />
                        <path strokeOpacity="0.7" strokeLinecap="round" d="M241.75 17.0773C251.653 45 302.152 74.5 332.152 46.5" />
                        <path strokeOpacity="0.9" strokeLinecap="round" d="M220.152 17.0773C230.055 45 274.652 81.5 288.652 47" />
                        <path strokeLinecap="round" d="M200.982 17.0773C209.652 55 239.152 80 245.652 58.5" />
                        <path strokeLinecap="round" d="M200.67 17.0773C192 55 162.5 80 156 58.5" />
                        <path strokeOpacity="0.9" strokeLinecap="round" d="M181.5 17.0773C171.597 45 127 81.5 113 47" />
                        <path strokeOpacity="0.7" strokeLinecap="round" d="M159.903 17.0773C150 45 99.4999 74.5 69.4999 46.5" />
                        <path strokeOpacity="0.5" strokeLinecap="round" d="M136.5 17.0773C127.5 38 77.9999 68 39.4999 42" />
                        <path strokeOpacity="0.3" strokeLinecap="round" d="M111 17.0773C106.879 34.8416 41.9999 50.5 14.4999 24" />
                        <path strokeOpacity="0.2" strokeLinecap="round" d="M87.7628 11.6484C78.9999 28.147 27 31.5 4.00004 0.999998" />
                    </svg>
                </div>
            </label>
        </div>
    );
};

export default OnlineButton;
