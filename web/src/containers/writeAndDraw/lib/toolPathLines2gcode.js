const toolPathLines2gcode = (toolPathLines, settings, write_and_draw) => {
    const work_speed_placeholder = settings.working_parameters.children.work_speed.placeholder;
    const jog_speed_placeholder = settings.working_parameters.children.jog_speed.placeholder;

    const work_speed_value = settings.working_parameters.children.work_speed.default_value;
    const jog_speed_value = settings.working_parameters.children.jog_speed.default_value;
    const jog_pen_offset = write_and_draw.jog_pen_offset.default_value;//空闲抬笔高度

    const {x, y} = settings.transformation.children;
    const translateX = x.default_value;
    const translateY = y.default_value;

    const gcodeLines = [];
    const header = [
        'G0 Z' + jog_pen_offset + ' F' + jog_speed_value,
    ];

    for (let i = 0; i < toolPathLines.length; i++) {
        const lineObj = toolPathLines[i];
        let line = ''; //G0 X1 Y2 F3000 ;this is comment
        let cmds = []; //[G0, X1, Y2, F3000...]
        let comment = null;
        let isEmptyLine = false;
        //lineObj: {G: 0, X: 1, Y: 2, C: 'this is comment', F: '#jog_speed#'}
        //1. comment放在最后
        //2. X，Y需要重新计算
        //3. F: '#jog_speed#'需要替换为实际值
        Object.keys(lineObj).forEach((key) => {
            let value = lineObj[key];
            switch (key) {
                case 'C':
                    // C: comment
                    comment = value;
                    break;
                case 'N':
                    //N: empty line
                    isEmptyLine = true;
                    break;
                case 'X':
                    value += translateX;
                    value = value.toFixed(2)
                    cmds.push(key + value);
                    break;
                case 'Y':
                    value += translateY;
                    value = value.toFixed(2)
                    cmds.push(key + value);
                    break;
                case 'F':
                    if (value === work_speed_placeholder) {
                        value = work_speed_value;
                    } else if (value === jog_speed_placeholder) {
                        value = jog_speed_value;
                    }
                    cmds.push(key + value);
                    break;
                case 'M':
                    if (value === 3) {
                        cmds.push('G1 Z0.00')
                    } else if (value === 5) {
                        cmds.push(`G0 Z${jog_pen_offset}`)
                    }
                    break;
                default:
                    cmds.push(key + value);
                    break
            }
        });

        if (isEmptyLine) {
            gcodeLines.push("\n");
            continue;
        }

        cmds.length > 0 && (line = cmds.join(' '));

        //comment放在最后面
        comment && (line += comment);

        gcodeLines.push(line);
    }

    //TODO：打印结束不应该执行M1112回home，打印底板可能高于home z，更好的是回 X0 Y0 Z10 类似的位置，比origin在z轴高一点的位置；或者结束位置抬高10mm也可以；这个需要观察用户使用习惯和场景
    return header.join('\n') + '\n\n\n' + gcodeLines.join('\n') + 'M1112\n';
};
export default toolPathLines2gcode;
